const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const {
  createReservation,
  getMyReservations,
  cancelReservation
} = require('../controllers/reservationController');

router.post('/', authenticateToken, createReservation);
router.get('/my', authenticateToken, getMyReservations);
router.delete('/:id', authenticateToken, cancelReservation);

module.exports = router;