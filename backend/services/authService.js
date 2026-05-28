const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const TOKEN_EXPIRATION = '1h';
const SALT_ROUNDS = 10;

// Έλεγχος βασικών πεδίων εγγραφής.
const requireRegisterFields = ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new Error('Όλα τα πεδία είναι υποχρεωτικά');
  }
};

// Αναζήτηση χρήστη με βάση το email.
const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

// Δημιουργία χρήστη με hashed password.
const createUser = async ({ name, email, password }) => {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );

  return result.insertId;
};

// Δημιουργία JWT token.
const buildToken = (user) =>
  jwt.sign(
    { userId: user.user_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRATION }
  );

// Επιστρέφει μόνο τα δημόσια στοιχεία χρήστη.
const publicUser = ({ user_id, name, email }) => ({ user_id, name, email });

exports.register = async (payload) => {
  requireRegisterFields(payload);

  const existingUser = await findUserByEmail(payload.email);
  if (existingUser) {
    throw new Error('Το email υπάρχει ήδη');
  }

  const userId = await createUser(payload);
  return { message: 'User created', userId };
};

exports.login = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  // Αν δεν υπάρχει χρήστης, το password θεωρείται άκυρο.
  const isValidPassword = user
    ? await bcrypt.compare(password, user.password_hash)
    : false;

  if (!user || !isValidPassword) {
    throw new Error('Wrong credentials');
  }

  return {
    message: 'Login successful',
    token: buildToken(user),
    user: publicUser(user)
  };
};

exports.getProfile = async (userId) => {
  const [rows] = await pool.query(
    'SELECT user_id, name, email FROM users WHERE user_id = ?',
    [userId]
  );

  const profile = rows[0];
  if (!profile) {
    throw new Error('User not found');
  }

  return profile;
};
