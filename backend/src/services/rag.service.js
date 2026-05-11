const pdfParse = require('pdf-parse');
const { generateEmbedding, chatWithGemini } = require('./gemini.service');
const { ChromaClient } = require('chromadb');

const chroma = new ChromaClient({ path: process.env.CHROMA_HOST || 'http://localhost:8000' });

// Split text into overlapping chunks
function chunkText(text, chunkSize = 500, overlap = 50) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
    if (i + chunkSize >= words.length) break;
  }
  return chunks;
}

async function indexPDF(pdfBuffer, collectionName, bookName) {
  // Extract text
  const data = await pdfParse(pdfBuffer);
  const chunks = chunkText(data.text);

  console.log(`[RAG] Parsed PDF: ${data.numpages} pages, ${chunks.length} chunks. Embedding sequentially...`);
  
  const myEmbeddingFunction = {
    generate: async (texts) => {
      const results = [];
      for (const text of texts) {
        const emb = await generateEmbedding(text);
        results.push(emb);
        // Rate limit: Gemini free tier allows 5 RPM for embeddings
        await new Promise(r => setTimeout(r, 1500));
      }
      return results;
    }
  };

  // Get or create collection
  const collection = await chroma.getOrCreateCollection({ 
    name: collectionName,
    embeddingFunction: myEmbeddingFunction
  });
  
  // Store chunks in small batches of 3 to stay within rate limits
  const batchSize = 3;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const uniquePrefix = `${bookName.replace(/\s/g,'_')}_${Date.now().toString(36)}`;
    
    await collection.add({
      ids: batch.map((_, j) => `chunk_${uniquePrefix}_${i + j}`),
      documents: batch,
      metadatas: batch.map(() => ({ bookName, source: bookName }))
    });
    
    console.log(`[RAG] Indexed chunks ${i+1}–${Math.min(i+batchSize, chunks.length)} / ${chunks.length}`);
    
    // Extra breathing room between batches
    if (i + batchSize < chunks.length) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  return { chunkCount: chunks.length, pageCount: data.numpages };
}

async function queryRAG(question, collectionNames, topK = 5) {
  const queryEmbedding = await generateEmbedding(question);
  
  let allResults = [];
  
  const myEmbeddingFunction = {
    generate: async (texts) => {
      return Promise.all(texts.map(text => generateEmbedding(text)));
    }
  };

  for (const collectionName of collectionNames) {
    try {
      const collection = await chroma.getCollection({ 
        name: collectionName,
        embeddingFunction: myEmbeddingFunction
      });
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
        include: ['documents', 'metadatas', 'distances']
      });
      
      if (results.documents && results.documents[0] && results.documents[0].length > 0) {
        results.documents[0].forEach((doc, idx) => {
          allResults.push({
            text: doc,
            bookName: results.metadatas[0][idx].bookName,
            similarity: 1 - results.distances[0][idx]
          });
        });
      }
    } catch (err) {
      console.error(`Collection ${collectionName} not found or query failed`);
    }
  }
  
  // Sort by similarity, take top 5
  allResults.sort((a, b) => b.similarity - a.similarity);
  const topResults = allResults.slice(0, 5);
  
  // Build RAG prompt
  const context = topResults
    .map((r, i) => `[Source ${i+1} - ${r.bookName}]:\n${r.text}`)
    .join('\n\n---\n\n');
  
  const ragPrompt = `You are a medical education assistant. Answer the question using ONLY the provided textbook excerpts.
If the answer is not in the excerpts, say so clearly.

TEXTBOOK EXCERPTS:
${context}

QUESTION: ${question}

Provide a clear, accurate answer and cite which source(s) you used.`;

  const answer = await chatWithGemini(ragPrompt, [], 'general');
  
  return { 
    answer, 
    sources: topResults.map(r => ({ bookName: r.bookName, chunk: r.text.slice(0, 200) + '...', similarity: r.similarity }))
  };
}

module.exports = { indexPDF, queryRAG };
