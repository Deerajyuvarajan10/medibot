const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/auth.middleware');
const { indexPDF } = require('../services/rag.service');
const admin = require('../config/firebase-admin');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/book', authMiddleware, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file provided' });
    
    const userId = req.user.uid;
    const bookName = req.body.bookName || 'Untitled Book';
    
    // For simplicity we create a single collection per user named {userId}_books
    const collectionName = `${userId}_books`.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    const result = await indexPDF(req.file.buffer, collectionName, bookName);
    
    // Save metadata to Firestore
    try {
      if (admin.apps.length > 0) {
        const bookRef = admin.firestore().collection('users').doc(userId).collection('books').doc();
        await bookRef.set({
          bookId: bookRef.id,
          name: bookName,
          fileName: req.file.originalname,
          pageCount: result.pageCount,
          chunkCount: result.chunkCount,
          collectionName: collectionName,
          uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
          sizeBytes: req.file.size
        });
        result.bookId = bookRef.id;
      }
    } catch (dbErr) {
      console.error('Failed to save to Firestore:', dbErr);
    }
    
    res.json({
      bookId: result.bookId || Date.now().toString(),
      name: bookName,
      chunkCount: result.chunkCount,
      pageCount: result.pageCount,
      message: 'Book uploaded and indexed successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
