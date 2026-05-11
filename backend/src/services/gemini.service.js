const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

const MEDICAL_SYSTEM_PROMPT = `You are MediBot, a helpful and accurate medical information AI assistant. 
You provide evidence-based medical information in a clear, compassionate manner.
Always remind users to consult healthcare professionals for personal medical advice.
Format responses with clear sections when appropriate.`;

const DOCTOR_SYSTEM_PROMPT = `You are MediBot in Doctor Mode. Analyze symptoms thoroughly and provide:
1. POSSIBLE CONDITIONS: List likely conditions based on symptoms
2. SEVERITY: Assess as Mild / Moderate / Serious
3. HOME CARE: Safe home remedies or OTC suggestions if appropriate  
4. WHEN TO SEEK HELP: Clear red flags requiring immediate medical attention
5. DISCLAIMER: Always end with "⚠️ This information is for educational purposes only. Please consult a qualified healthcare provider for proper diagnosis and treatment."
Be thorough but concise. Use simple language.`;

async function chatWithGemini(message, history = [], mode = 'general') {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    systemInstruction: mode === 'doctor' ? DOCTOR_SYSTEM_PROMPT : MEDICAL_SYSTEM_PROMPT
  });

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(message);
  return result.response.text();
}

async function analyzeImageWithGemini(base64Image, mimeType, question) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `${DOCTOR_SYSTEM_PROMPT}\n\nAnalyze this medical image. The user asks: "${question || 'What do you observe in this image?'}"\n\nProvide:\n1. OBSERVATIONS: What you see in the image\n2. POSSIBLE CONDITIONS: If applicable\n3. RECOMMENDED ACTIONS: What the person should do\n4. URGENCY LEVEL: routine / see doctor soon / urgent / emergency\n\nAlways end with the disclaimer about consulting a healthcare professional.`;

  const result = await model.generateContent([
    { inlineData: { mimeType, data: base64Image } },
    { text: prompt }
  ]);
  
  return result.response.text();
}

async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

module.exports = { chatWithGemini, analyzeImageWithGemini, generateEmbedding };
