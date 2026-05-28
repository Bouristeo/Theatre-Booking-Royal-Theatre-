const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Χτίζει δυναμικά το query για showtimes.
const buildShowtimesQuery = ({ showId, date }) => {
  const conditions = [];
  const params = [];

  if (showId) {
    conditions.push('st.show_id = ?');
    params.push(showId);
  }

  if (date) {
    conditions.push('st.show_date = ?');
    params.push(date);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  return {
    sql: `
      SELECT
        st.showtime_id,
        st.show_id,
        st.show_date,
        st.show_time,
        st.hall_name,
        st.base_price,
        s.title
      FROM showtimes st
      JOIN shows s ON st.show_id = s.show_id
      ${where}
      ORDER BY st.show_date, st.show_time
    `,
    params
  };
};

router.get('/', async (req, res) => {
  try {
    const { sql, params } = buildShowtimesQuery(req.query);
    const [showtimes] = await pool.query(sql, params);

    res.json(showtimes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
