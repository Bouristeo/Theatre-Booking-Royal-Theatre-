const pool = require('../config/db');

// Προσθήκη φίλτρου στο query.
const addFilter = (filters, condition, values = []) => {
  filters.conditions.push(condition);
  filters.params.push(...values);
};

// Δημιουργία LIKE όρου για αναζήτηση.
const likeTerm = (value) => `%${value}%`;

exports.getShows = async ({ q, theatreId }) => {
  const filters = {
    conditions: [],
    params: []
  };

  if (theatreId) {
    addFilter(filters, 's.theatre_id = ?', [theatreId]);
  }

  if (q) {
    const term = likeTerm(q);
    addFilter(filters, '(s.title LIKE ? OR t.name LIKE ? OR t.location LIKE ?)', [term, term, term]);
  }

  const whereClause = filters.conditions.length
    ? `WHERE ${filters.conditions.join(' AND ')}`
    : '';

  // Φέρνει παραστάσεις μαζί με στοιχεία θεάτρου.
  const [shows] = await pool.query(
    `SELECT s.*, t.name AS theatre_name, t.location
     FROM shows s
     JOIN theatres t ON s.theatre_id = t.theatre_id
     ${whereClause}`,
    filters.params
  );

  return shows;
};

exports.getShowById = async (id) => {
  const [shows] = await pool.query(
    `SELECT s.*, t.name AS theatre_name, t.location
     FROM shows s
     JOIN theatres t ON s.theatre_id = t.theatre_id
     WHERE s.show_id = ?`,
    [id]
  );

  const show = shows[0];
  if (!show) {
    throw new Error('Show not found');
  }

  return show;
};

exports.getShowtimes = async ({ showId }) => {
  const params = [];
  const whereClause = showId ? 'WHERE show_id = ?' : '';

  if (showId) {
    params.push(showId);
  }

  const [showtimes] = await pool.query(
    `SELECT * FROM showtimes ${whereClause}`,
    params
  );

  return showtimes;
};
