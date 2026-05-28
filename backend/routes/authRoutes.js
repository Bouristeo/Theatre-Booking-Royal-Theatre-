const express = require('express');
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Routes για authentication.
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/profile', authenticateToken, authController.profile);

module.exports = router;
