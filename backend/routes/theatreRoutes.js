const express = require('express');
const theatreController = require('../controllers/theatreController');

const router = express.Router();

// Route για λίστα θεάτρων.
router.get('/', theatreController.getTheatres);

module.exports = router;
