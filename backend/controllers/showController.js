const showService = require('../services/showService');

// Wrapper για κοινό try/catch στα controllers.
const respond = (handler, errorStatus = 500) => async (req, res) => {
  try {
    const data = await handler(req);
    res.json(data);
  } catch (err) {
    res.status(errorStatus).json({ error: err.message });
  }
};

// Λίστα παραστάσεων με προαιρετικά φίλτρα.
exports.getShows = respond((req) => showService.getShows(req.query));

// Επιστροφή μίας παράστασης με id.
exports.getShowById = respond(
  (req) => showService.getShowById(req.params.id),
  404
);

// Επιστροφή showtimes.
exports.getShowtimes = respond((req) => showService.getShowtimes(req.query));
