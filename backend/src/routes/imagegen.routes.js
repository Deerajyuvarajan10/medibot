const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

router.post('/generate', authMiddleware, async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const medicalEnhancement = 'medical illustration, anatomically accurate, educational, professional, clean white background, high quality diagram';
    const enhancedPrompt = `${prompt}, ${medicalEnhancement}`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${Date.now()}`;
    
    res.json({ imageUrl, enhancedPrompt });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
