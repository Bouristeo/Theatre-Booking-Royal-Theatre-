const pool = require('../config/db');

// Φτιάχνει φίλτρο αναζήτησης για θέατρα.
const buildSearchFilter = (q) => {
  if (!q) {
    return { where: '', params: [] };
  }

  const term = `%${q}%`;

  return {
    where: 'WHERE name LIKE ? OR location LIKE ? OR description LIKE ?',
    params: [term, term, term]
  };
};

exports.getTheatres = async ({ q }) => {
  const { where, params } = buildSearchFilter(q);
  const [theatres] = await pool.query(`SELECT * FROM theatres ${where}`, params);

  return theatres;
};
