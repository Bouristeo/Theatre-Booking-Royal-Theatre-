const theatreService = require('../services/theatreService');

// Επιστρέφει τα θέατρα με προαιρετική αναζήτηση.
exports.getTheatres = async (req, res) => {
  try {
    const theatres = await theatreService.getTheatres(req.query);
    res.json(theatres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
