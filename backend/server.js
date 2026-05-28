const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Κεντρική δήλωση όλων των routes.
const routes = [
  ['/auth', require('./routes/authRoutes')],
  ['/theatres', require('./routes/theatreRoutes')],
  ['/shows', require('./routes/showRoutes')],
  ['/reservations', require('./routes/reservationRoutes')],
  ['/showtimes', require('./routes/showtimes')],
  ['/seats', require('./routes/seats')]
];

app.use(cors());
app.use(express.json());

// Σύνδεση κάθε route με το αντίστοιχο path.
routes.forEach(([path, router]) => app.use(path, router));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
