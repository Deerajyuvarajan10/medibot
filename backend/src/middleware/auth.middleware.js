const admin = require('../config/firebase-admin');

async function authMiddleware(req, res, next) {
  req.user = { uid: 'test_uid' };
  next();
}

module.exports = authMiddleware;
