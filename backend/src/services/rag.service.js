const pdfParse = require('pdf-parse');
const { generateEmbedding, chatWithGemini } = require('./gemini.service');

// Zero-dependency in-memory vector store for free deployments
// Note: On Render free tier, this will reset if the server restarts.
const vectorStore = [];

function chunkText(text, chunkSize = 500, overlap = 50) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
    if (i + chunkSize >= words.length) break;
  }
  return chunks;
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function indexPDF(pdfBuffer, collectionName, bookName) {
  const data = await pdfParse(pdfBuffer);
  const chunks = chunkText(data.text);
  
  console.log(`[RAG] Parsed PDF: ${data.numpages} pages, ${chunks.length} chunks. Embedding sequentially...`);
  
  // Clean up any old chunks for this book to prevent duplicates
  for (let i = vectorStore.length - 1; i >= 0; i--) {
    if (vectorStore[i].bookName === bookName && vectorStore[i].collectionName === collectionName) {
      vectorStore.splice(i, 1);
    }
  }

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await generateEmbedding(chunk);
    
    vectorStore.push({
      id: `${bookName}_${Date.now()}_${i}`,
      collectionName,
      bookName,
      text: chunk,
      embedding
    });
    
    console.log(`[RAG] Indexed chunk ${i+1} / ${chunks.length}`);
    await new Promise(r => setTimeout(r, 1500)); // Rate limit protection
  }
  
  return { chunkCount: chunks.length, pageCount: data.numpages };
}

async function queryRAG(question, collectionNames, topK = 5) {
  const queryEmbedding = await generateEmbedding(question);
  
  // Filter chunks belonging to requested collections
  const relevantChunks = vectorStore.filter(item => collectionNames.includes(item.collectionName));
  
  // Calculate similarity
  const scoredChunks = relevantChunks.map(item => ({
    ...item,
    similarity: cosineSimilarity(queryEmbedding, item.embedding)
  }));
  
  // Sort by highest similarity
  scoredChunks.sort((a, b) => b.similarity - a.similarity);
  const topResults = scoredChunks.slice(0, topK);
  
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
