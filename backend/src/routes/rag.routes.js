const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { queryRAG } = require('../services/rag.service');

router.post('/query', authMiddleware, async (req, res, next) => {
  try {
    const { message } = req.body;
    // For now we'll search all collections for this user.
    // Ideally the user passes the selected book IDs.
    // For simplicity let's assume they want to search a default collection or we fetch all their books from firestore.
    // To implement properly, we need the frontend to send the selected collection names.
    const userId = req.user.uid;
    
    // As a placeholder, we use a single global user collection for testing if specific collections aren't passed
    const collectionNames = req.body.collectionNames || [`${userId}_books`];
    
    const result = await queryRAG(message, collectionNames);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
