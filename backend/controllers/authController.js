const authService = require('../services/authService');

// Κοινή αποστολή error response.
const sendError = (res, status, err) => {
  res.status(status).json({ message: err.message });
};

// Δημιουργία νέου χρήστη.
exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    sendError(res, 400, err);
  }
};

// Σύνδεση χρήστη και επιστροφή token.
exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    sendError(res, 400, err);
  }
};

// Επιστροφή στοιχείων συνδεδεμένου χρήστη.
exports.profile = async (req, res) => {
  try {
    const profile = await authService.getProfile(req.user.userId);
    res.json(profile);
  } catch (err) {
    sendError(res, 404, err);
  }
};
