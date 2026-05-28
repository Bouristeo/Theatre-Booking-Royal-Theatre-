-- database.sql
-- Βάση δεδομένων για την εφαρμογή κράτησης θεατρικών θέσεων.
-- Τρέχει σε MariaDB και ταιριάζει με τα fields που χρησιμοποιεί το backend.

DROP DATABASE IF EXISTS theatre_booking;
CREATE DATABASE theatre_booking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE theatre_booking;

-- Πίνακας χρηστών
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Πίνακας θεάτρων
CREATE TABLE theatres (
  theatre_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(150) NOT NULL,
  description TEXT,
  image_url VARCHAR(500)
);

-- Πίνακας παραστάσεων
CREATE TABLE shows (
  show_id INT AUTO_INCREMENT PRIMARY KEY,
  theatre_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  duration INT NOT NULL,
  age_rating VARCHAR(20),
  image_url VARCHAR(500),
  FOREIGN KEY (theatre_id) REFERENCES theatres(theatre_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Διαθέσιμες ημέρες και ώρες παραστάσεων
CREATE TABLE showtimes (
  showtime_id INT AUTO_INCREMENT PRIMARY KEY,
  show_id INT NOT NULL,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  hall_name VARCHAR(100) NOT NULL,
  base_price DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (show_id) REFERENCES shows(show_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Θέσεις ανά showtime
CREATE TABLE seats (
  seat_id INT AUTO_INCREMENT PRIMARY KEY,
  showtime_id INT NOT NULL,
  row_label VARCHAR(5) NOT NULL,
  seat_number INT NOT NULL,
  category VARCHAR(50) DEFAULT 'standard',
  is_reserved TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (showtime_id) REFERENCES showtimes(showtime_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  UNIQUE KEY unique_seat_per_showtime (showtime_id, row_label, seat_number)
);

-- Κρατήσεις χρηστών
CREATE TABLE reservations (
  reservation_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  showtime_id INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('active', 'cancelled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (showtime_id) REFERENCES showtimes(showtime_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Συσχέτιση κράτησης με θέσεις
CREATE TABLE reservation_seats (
  reservation_id INT NOT NULL,
  seat_id INT NOT NULL,
  PRIMARY KEY (reservation_id, seat_id),
  FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (seat_id) REFERENCES seats(seat_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Indexes για πιο γρήγορη αναζήτηση
CREATE INDEX idx_theatres_location ON theatres(location);
CREATE INDEX idx_shows_title ON shows(title);
CREATE INDEX idx_showtimes_show_date ON showtimes(show_id, show_date);
CREATE INDEX idx_reservations_user ON reservations(user_id);

-- Ενδεικτικά θέατρα
INSERT INTO theatres (name, location, description, image_url) VALUES
('Εθνικό Θέατρο', 'Αθήνα', 'Κεντρικό θέατρο με κλασικές και σύγχρονες παραστάσεις.', 'https://images.unsplash.com/photo-1503095396549-807759245b35'),
('Θέατρο Βορείου Ελλάδος', 'Θεσσαλονίκη', 'Μεγάλος θεατρικός οργανισμός στη Θεσσαλονίκη.', 'https://images.unsplash.com/photo-1516307365426-bea591f05011'),
('Δημοτικό Θέατρο Πειραιά', 'Πειραιάς', 'Ιστορικό θέατρο με πλούσιο πρόγραμμα.', 'https://images.unsplash.com/photo-1507924538820-ede94a04019d');

-- Ενδεικτικές παραστάσεις
INSERT INTO shows (theatre_id, title, description, duration, age_rating, image_url) VALUES
(1, 'Άμλετ', 'Κλασική τραγωδία του William Shakespeare.', 120, '12+', 'https://images.unsplash.com/photo-1503095396549-807759245b35'),
(1, 'Αντιγόνη', 'Αρχαία ελληνική τραγωδία με σύγχρονη σκηνοθετική ματιά.', 95, '10+', 'https://images.unsplash.com/photo-1522776203873-e69a0ee4caa5'),
(2, 'Ο Επιθεωρητής', 'Κωμωδία με κοινωνική σάτιρα.', 105, '8+', 'https://images.unsplash.com/photo-1522776203873-e69a0ee4caa5'),
(3, 'Μια Νύχτα στο Θέατρο', 'Σύγχρονη ελληνική παράσταση.', 90, 'Όλοι', 'https://images.unsplash.com/photo-1516307365426-bea591f05011');

-- Ενδεικτικά showtimes
INSERT INTO showtimes (show_id, show_date, show_time, hall_name, base_price) VALUES
(1, '2026-06-05', '20:30:00', 'Κεντρική Σκηνή', 15.00),
(1, '2026-06-06', '21:00:00', 'Κεντρική Σκηνή', 15.00),
(2, '2026-06-07', '19:30:00', 'Νέα Σκηνή', 12.00),
(3, '2026-06-08', '20:00:00', 'Αίθουσα Α', 10.00),
(4, '2026-06-09', '21:15:00', 'Κεντρική Σκηνή', 14.00);

-- Δημιουργία θέσεων για κάθε showtime.
-- Για κάθε ώρα παράστασης μπαίνουν 3 σειρές x 8 θέσεις.
INSERT INTO seats (showtime_id, row_label, seat_number, category)
SELECT
  st.showtime_id,
  rows_data.row_label,
  numbers_data.seat_number,
  CASE
    WHEN rows_data.row_label = 'A' THEN 'vip'
    ELSE 'standard'
  END AS category
FROM showtimes st
CROSS JOIN (
  SELECT 'A' AS row_label
  UNION ALL SELECT 'B'
  UNION ALL SELECT 'C'
) AS rows_data
CROSS JOIN (
  SELECT 1 AS seat_number
  UNION ALL SELECT 2
  UNION ALL SELECT 3
  UNION ALL SELECT 4
  UNION ALL SELECT 5
  UNION ALL SELECT 6
  UNION ALL SELECT 7
  UNION ALL SELECT 8
) AS numbers_data;
