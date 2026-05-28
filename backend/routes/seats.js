const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Επιστρέφει τις θέσεις για συγκεκριμένο showtime.
router.get('/:showtimeId', async (req, res) => {
  try {
    const [seats] = await pool.query(
      `SELECT seat_id, showtime_id, row_label, seat_number, category, is_reserved
       FROM seats
       WHERE showtime_id = ?
       ORDER BY row_label, seat_number`,
      [req.params.showtimeId]
    );

    res.json(seats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
