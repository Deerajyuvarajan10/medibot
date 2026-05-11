const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/auth.middleware');
const { chatWithGemini, analyzeImageWithGemini } = require('../services/gemini.service');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/chat', authMiddleware, async (req, res, next) => {
  try {
    const { message, conversationHistory } = req.body;
    const reply = await chatWithGemini(message, conversationHistory, 'doctor');
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

router.post('/analyze-image', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });
    
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const question = req.body.question || '';
    
    const analysis = await analyzeImageWithGemini(base64Image, mimeType, question);
    res.json({ analysis });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
