const express = require('express');
const showController = require('../controllers/showController');

const router = express.Router();

// Routes για παραστάσεις και ώρες προβολών.
router.get('/', showController.getShows);
router.get('/showtimes/all', showController.getShowtimes);
router.get('/:id', showController.getShowById);

module.exports = router;
