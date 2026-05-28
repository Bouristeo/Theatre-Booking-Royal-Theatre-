const pool = require('../config/db');

const ACTIVE_STATUS = 'active';
const CANCELLED_STATUS = 'cancelled';

// Εκτελεί ενέργειες με transaction για ασφάλεια.
const runInTransaction = async (task) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await task(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Έλεγχος εισόδου για νέα κράτηση.
const validateReservationInput = ({ showtime_id, seats }) => {
  if (!showtime_id || !Array.isArray(seats) || seats.length === 0) {
    throw new Error('Missing or invalid data');
  }
};

// Φέρνει τις ζητούμενες θέσεις για συγκεκριμένο showtime.
const getSeatsForShowtime = async (connection, showtimeId, seatIds) => {
  const [seats] = await connection.query(
    `SELECT seat_id, is_reserved
     FROM seats
     WHERE showtime_id = ? AND seat_id IN (?)`,
    [showtimeId, seatIds]
  );

  return seats;
};

// Ελέγχει ότι όλες οι θέσεις ανήκουν στο showtime.
const makeSureSeatsBelongToShowtime = (dbSeats, requestedSeats) => {
  if (dbSeats.length !== requestedSeats.length) {
    throw new Error('Some seats do not belong to this showtime');
  }
};

// Ελέγχει αν υπάρχει ήδη κρατημένη θέση.
const makeSureSeatsAreAvailable = (seats) => {
  const reservedSeat = seats.find((seat) => seat.is_reserved === 1);

  if (reservedSeat) {
    throw new Error('Some seats are already reserved');
  }
};

// Φέρνει την τιμή του showtime.
const getShowtime = async (connection, showtimeId) => {
  const [showtimes] = await connection.query(
    'SELECT base_price FROM showtimes WHERE showtime_id = ?',
    [showtimeId]
  );

  const showtime = showtimes[0];
  if (!showtime) {
    throw new Error('Showtime not found');
  }

  return showtime;
};

// Δημιουργεί την εγγραφή κράτησης.
const createReservationRecord = async (connection, userId, showtimeId, totalPrice) => {
  const [result] = await connection.query(
    `INSERT INTO reservations (user_id, showtime_id, total_price, status)
     VALUES (?, ?, ?, ?)`,
    [userId, showtimeId, totalPrice, ACTIVE_STATUS]
  );

  return result.insertId;
};

// Συνδέει την κράτηση με τις θέσεις.
const saveReservationSeats = async (connection, reservationId, seats) => {
  const values = seats.map((seatId) => [reservationId, seatId]);

  await connection.query(
    'INSERT INTO reservation_seats (reservation_id, seat_id) VALUES ?',
    [values]
  );
};

// Ενημερώνει αν οι θέσεις είναι δεσμευμένες ή ελεύθερες.
const updateSeatAvailability = async (connection, showtimeId, seats, isReserved) => {
  await connection.query(
    `UPDATE seats
     SET is_reserved = ?
     WHERE showtime_id = ? AND seat_id IN (?)`,
    [isReserved ? 1 : 0, showtimeId, seats]
  );
};

exports.createReservation = async (userId, body) => {
  validateReservationInput(body);

  const { showtime_id: showtimeId, seats } = body;

  return runInTransaction(async (connection) => {
    const seatRows = await getSeatsForShowtime(connection, showtimeId, seats);
    makeSureSeatsBelongToShowtime(seatRows, seats);
    makeSureSeatsAreAvailable(seatRows);

    const showtime = await getShowtime(connection, showtimeId);
    const totalPrice = seats.length * Number(showtime.base_price);

    const reservationId = await createReservationRecord(
      connection,
      userId,
      showtimeId,
      totalPrice
    );

    await saveReservationSeats(connection, reservationId, seats);
    await updateSeatAvailability(connection, showtimeId, seats, true);

    return {
      message: 'Reservation created successfully',
      reservationId
    };
  });
};

exports.getMyReservations = async (userId) => {
  // Επιστρέφει τις κρατήσεις μαζί με παράσταση και θέσεις.
  const [reservations] = await pool.query(
    `SELECT
       r.reservation_id,
       r.showtime_id,
       r.total_price,
       r.status,
       s.show_date,
       s.show_time,
       sh.title AS show_title,
       rs.seat_id,
       st.row_label,
       st.seat_number,
       st.category
     FROM reservations r
     JOIN showtimes s ON r.showtime_id = s.showtime_id
     JOIN shows sh ON s.show_id = sh.show_id
     LEFT JOIN reservation_seats rs ON r.reservation_id = rs.reservation_id
     LEFT JOIN seats st ON rs.seat_id = st.seat_id
     WHERE r.user_id = ?
     ORDER BY r.reservation_id DESC, st.row_label, st.seat_number`,
    [userId]
  );

  return reservations;
};

// Βρίσκει ενεργή κράτηση του χρήστη.
const getActiveReservation = async (connection, userId, reservationId) => {
  const [reservations] = await connection.query(
    `SELECT *
     FROM reservations
     WHERE reservation_id = ? AND user_id = ? AND status = ?`,
    [reservationId, userId, ACTIVE_STATUS]
  );

  const reservation = reservations[0];
  if (!reservation) {
    throw new Error('Reservation not found');
  }

  return reservation;
};

// Ενώνει ημερομηνία και ώρα σε Date object.
const buildShowDateTime = ({ show_date, show_time }) =>
  new Date(`${String(show_date).slice(0, 10)}T${show_time}`);

// Επιτρέπει ακύρωση μόνο για μελλοντικές παραστάσεις.
const makeSureShowtimeIsFuture = (showtime) => {
  if (buildShowDateTime(showtime) <= new Date()) {
    throw new Error('Only future reservations can be cancelled');
  }
};

// Φέρνει ημερομηνία και ώρα showtime.
const getShowtimeDate = async (connection, showtimeId) => {
  const [showtimes] = await connection.query(
    'SELECT show_date, show_time FROM showtimes WHERE showtime_id = ?',
    [showtimeId]
  );

  const showtime = showtimes[0];
  if (!showtime) {
    throw new Error('Showtime not found');
  }

  return showtime;
};

// Παίρνει όλες τις θέσεις της κράτησης.
const getReservationSeatIds = async (connection, reservationId) => {
  const [rows] = await connection.query(
    'SELECT seat_id FROM reservation_seats WHERE reservation_id = ?',
    [reservationId]
  );

  return rows.map(({ seat_id }) => seat_id);
};

// Διαγράφει τη σύνδεση κράτησης-θέσεων.
const removeReservationSeats = async (connection, reservationId) => {
  await connection.query(
    'DELETE FROM reservation_seats WHERE reservation_id = ?',
    [reservationId]
  );
};

// Αλλάζει το status της κράτησης σε cancelled.
const markReservationAsCancelled = async (connection, reservationId) => {
  await connection.query(
    'UPDATE reservations SET status = ? WHERE reservation_id = ?',
    [CANCELLED_STATUS, reservationId]
  );
};

exports.cancelReservation = async (userId, reservationId) =>
  runInTransaction(async (connection) => {
    const reservation = await getActiveReservation(connection, userId, reservationId);
    const showtime = await getShowtimeDate(connection, reservation.showtime_id);

    makeSureShowtimeIsFuture(showtime);

    const reservedSeatIds = await getReservationSeatIds(connection, reservationId);

    if (reservedSeatIds.length) {
      await updateSeatAvailability(
        connection,
        reservation.showtime_id,
        reservedSeatIds,
        false
      );
    }

    await removeReservationSeats(connection, reservationId);
    await markReservationAsCancelled(connection, reservationId);

    return { message: 'Reservation cancelled successfully' };
  });
