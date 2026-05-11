const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { chatWithGemini } = require('../services/gemini.service');

router.post('/general', authMiddleware, async (req, res, next) => {
  try {
    const { message, conversationHistory } = req.body;
    const reply = await chatWithGemini(message, conversationHistory, 'general');
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
