const reservationService = require('../services/reservationService');

// Δημιουργία νέας κράτησης.
exports.createReservation = async (req, res) => {
  try {
    const result = await reservationService.createReservation(req.user.userId, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Επιστρέφει τις κρατήσεις του συνδεδεμένου χρήστη.
exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await reservationService.getMyReservations(req.user.userId);
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Ακύρωση κράτησης.
exports.cancelReservation = async (req, res) => {
  try {
    const result = await reservationService.cancelReservation(
      req.user.userId,
      req.params.id
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
