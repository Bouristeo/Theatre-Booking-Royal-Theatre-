# Theatre Booking System

## Περιγραφή

Το **Theatre Booking System** είναι μια ολοκληρωμένη εφαρμογή κρατήσεων θέσεων για θεατρικές παραστάσεις. Ο χρήστης μπορεί να δημιουργήσει λογαριασμό, να συνδεθεί, να δει διαθέσιμα θέατρα και παραστάσεις, να επιλέξει ημερομηνία και ώρα παράστασης, να διαλέξει συγκεκριμένες θέσεις και να ολοκληρώσει την κράτησή του.

Η εφαρμογή ακολουθεί αρχιτεκτονική κατανεμημένου συστήματος, όπου το frontend επικοινωνεί με ένα REST API backend, το οποίο με τη σειρά του συνδέεται με βάση δεδομένων MariaDB.

---

## Περιεχόμενα

- [Βασικές Λειτουργίες](#βασικές-λειτουργίες)
- [Τεχνολογίες](#τεχνολογίες)
- [Αρχιτεκτονική Συστήματος](#αρχιτεκτονική-συστήματος)
- [Δομή Project](#δομή-project)
- [Βάση Δεδομένων](#βάση-δεδομένων)
- [Εγκατάσταση](#εγκατάσταση)
- [Ρύθμιση Backend](#ρύθμιση-backend)
- [Ρύθμιση Frontend](#ρύθμιση-frontend)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Έλεγχος με Postman](#έλεγχος-με-postman)
- [Ασφάλεια](#ασφάλεια)
- [Μελλοντικές Βελτιώσεις](#μελλοντικές-βελτιώσεις)
- [Στοιχεία Εργασίας](#στοιχεία-εργασίας)

---

## Βασικές Λειτουργίες

### Χρήστης

- Εγγραφή νέου χρήστη.
- Σύνδεση χρήστη με email και password.
- Δημιουργία JWT token μετά από επιτυχημένη σύνδεση.
- Προβολή προφίλ συνδεδεμένου χρήστη.
- Αποσύνδεση χρήστη.

### Θέατρα και Παραστάσεις

- Προβολή λίστας διαθέσιμων θεάτρων.
- Προβολή λίστας θεατρικών παραστάσεων.
- Αναζήτηση με βάση:
  - όνομα θεάτρου,
  - τοποθεσία,
  - τίτλο παράστασης.
- Προβολή λεπτομερειών παράστασης, όπως:
  - τίτλος,
  - περιγραφή,
  - διάρκεια,
  - ηλικιακή ένδειξη,
  - όνομα θεάτρου,
  - τοποθεσία.

### Showtimes

- Προβολή διαθέσιμων ημερομηνιών και ωρών για κάθε παράσταση.
- Προβολή αίθουσας.
- Προβολή βασικής τιμής εισιτηρίου.

### Θέσεις

- Προβολή θέσεων για συγκεκριμένο showtime.
- Διαφορετική εμφάνιση για διαθέσιμες, επιλεγμένες και κρατημένες θέσεις.
- Επιλογή πολλαπλών θέσεων.
- Αποτροπή επιλογής ήδη κρατημένων θέσεων.

### Κρατήσεις

- Δημιουργία κράτησης.
- Υπολογισμός συνολικού κόστους.
- Αποθήκευση κράτησης στη βάση δεδομένων.
- Προβολή κρατήσεων συνδεδεμένου χρήστη.
- Ακύρωση ενεργής κράτησης.
- Απελευθέρωση θέσεων μετά την ακύρωση κράτησης.

---

## Τεχνολογίες

### Frontend

- React
- Vite
- JavaScript
- CSS
- Axios

### Backend

- Node.js
- Express.js
- JWT
- bcrypt
- dotenv
- cors
- mysql2

### Database

- MariaDB
- SQL
- Primary Keys
- Foreign Keys
- Relational Database Schema

### Εργαλεία Ανάπτυξης

- Visual Studio Code
- Postman
- GitHub
- MariaDB CLI
- Chrome DevTools

---

## Αρχιτεκτονική Συστήματος

Η εφαρμογή βασίζεται σε client-server αρχιτεκτονική.

```text
Frontend Client
      |
      | HTTP Requests μέσω Axios
      |
Node.js / Express REST API
      |
      | SQL Queries
      |
MariaDB Database
```

Το backend είναι οργανωμένο σε επίπεδα:

```text
Routes → Controllers → Services → Database
```

Αυτός ο διαχωρισμός κάνει τον κώδικα πιο καθαρό, πιο επεκτάσιμο και πιο εύκολο στη συντήρηση.

---

## Δομή Project

```text
theatre-booking-system/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── reservationController.js
│   │   ├── showController.js
│   │   └── theatreController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── reservationRoutes.js
│   │   ├── showRoutes.js
│   │   ├── showtimes.js
│   │   ├── theatreRoutes.js
│   │   └── seats.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── reservationService.js
│   │   ├── showService.js
│   │   └── theatreService.js
│   │
│   ├── database.sql
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── theatre-mask.png
│   │
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── screenshots/
│   ├── login.png
│   ├── home.png
│   ├── shows.png
│   ├── booking.png
│   └── reservations.png
│
├── .gitignore
└── README.md
```

---

## Βάση Δεδομένων

Η βάση δεδομένων είναι σε MariaDB και ονομάζεται:

```sql
theatre_booking
```

### Πίνακες

| Πίνακας | Περιγραφή |
|---|---|
| `users` | Αποθήκευση χρηστών |
| `theatres` | Αποθήκευση θεάτρων |
| `shows` | Αποθήκευση παραστάσεων |
| `showtimes` | Ημερομηνίες, ώρες, αίθουσες και τιμές |
| `seats` | Θέσεις ανά showtime |
| `reservations` | Κρατήσεις χρηστών |
| `reservation_seats` | Σύνδεση κρατήσεων με θέσεις |

### Σχέσεις Πινάκων

- Ένα θέατρο έχει πολλές παραστάσεις.
- Μία παράσταση έχει πολλά showtimes.
- Ένα showtime έχει πολλές θέσεις.
- Ένας χρήστης έχει πολλές κρατήσεις.
- Μία κράτηση μπορεί να περιλαμβάνει πολλές θέσεις.
- Η σχέση κρατήσεων και θέσεων υλοποιείται μέσω του πίνακα `reservation_seats`.

```text
theatres 1 ─── N shows
shows 1 ─── N showtimes
showtimes 1 ─── N seats
users 1 ─── N reservations
reservations N ─── N seats
```

---

## Εγκατάσταση

### Προαπαιτούμενα

Πριν την εκτέλεση της εφαρμογής πρέπει να υπάρχουν εγκατεστημένα:

- Node.js
- npm
- MariaDB Server
- Git
- Postman

Έλεγχος Node.js:

```bash
node -v
```

Έλεγχος npm:

```bash
npm -v
```

---

## Ρύθμιση Βάσης Δεδομένων

### 1. Άνοιγμα MariaDB

Σε Windows:

```bash
"C:\Program Files\MariaDB 12.2\bin\mariadb.exe" -u root -p
```

### 2. Εκτέλεση του SQL αρχείου

Μέσα στη MariaDB:

```sql
SOURCE C:/path/to/backend/database.sql;
```

Παράδειγμα:

```sql
SOURCE C:/Users/Toto/Desktop/Bachelor/znd 26/backend/database.sql;
```

### 3. Έλεγχος βάσης

```sql
USE theatre_booking;
SHOW TABLES;
```

Αναμενόμενοι πίνακες:

```text
users
theatres
shows
showtimes
seats
reservations
reservation_seats
```

### 4. Έλεγχος αρχικών δεδομένων

```sql
SELECT * FROM theatres;
SELECT * FROM shows;
SELECT * FROM showtimes;
SELECT COUNT(*) FROM seats;
```

---

## Ρύθμιση Backend

### 1. Μετάβαση στον φάκελο backend

```bash
cd backend
```

### 2. Εγκατάσταση dependencies

```bash
npm install
```

### 3. Δημιουργία `.env`

Στον φάκελο `backend` δημιουργείται αρχείο `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=theatre_booking
JWT_SECRET=your_jwt_secret
PORT=5000
```

Για το GitHub πρέπει να ανεβαίνει μόνο το `.env.example`, όχι το πραγματικό `.env`.

### 4. Εκτέλεση backend

```bash
npm run dev
```

Αν όλα λειτουργούν σωστά, εμφανίζεται:

```text
Server running on port 5000
```

Backend URL:

```text
http://localhost:5000
```

Γρήγορος έλεγχος:

```text
http://localhost:5000/theatres
```

---

## Ρύθμιση Frontend

### 1. Μετάβαση στον φάκελο frontend

```bash
cd frontend
```

### 2. Εγκατάσταση dependencies

```bash
npm install
```

### 3. Εκτέλεση frontend

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Περιγραφή | Προστατευμένο |
|---|---|---|---|
| POST | `/auth/register` | Εγγραφή νέου χρήστη | Όχι |
| POST | `/auth/login` | Σύνδεση χρήστη και επιστροφή JWT | Όχι |
| GET | `/auth/profile` | Προφίλ συνδεδεμένου χρήστη | Ναι |

### Theatres

| Method | Endpoint | Περιγραφή | Προστατευμένο |
|---|---|---|---|
| GET | `/theatres` | Λίστα θεάτρων | Όχι |
| GET | `/theatres?q=Athens` | Αναζήτηση θεάτρων | Όχι |

### Shows

| Method | Endpoint | Περιγραφή | Προστατευμένο |
|---|---|---|---|
| GET | `/shows` | Λίστα παραστάσεων | Όχι |
| GET | `/shows?q=Hamlet` | Αναζήτηση παραστάσεων | Όχι |
| GET | `/shows/:id` | Λεπτομέρειες παράστασης | Όχι |

### Showtimes

| Method | Endpoint | Περιγραφή | Προστατευμένο |
|---|---|---|---|
| GET | `/showtimes` | Όλα τα showtimes | Όχι |
| GET | `/showtimes?showId=1` | Showtimes συγκεκριμένης παράστασης | Όχι |

### Seats

| Method | Endpoint | Περιγραφή | Προστατευμένο |
|---|---|---|---|
| GET | `/seats/:showtimeId` | Θέσεις συγκεκριμένου showtime | Όχι |

### Reservations

| Method | Endpoint | Περιγραφή | Προστατευμένο |
|---|---|---|---|
| POST | `/reservations` | Δημιουργία κράτησης | Ναι |
| GET | `/reservations/my` | Κρατήσεις συνδεδεμένου χρήστη | Ναι |
| DELETE | `/reservations/:id` | Ακύρωση κράτησης | Ναι |

---

## Authentication

Η εφαρμογή χρησιμοποιεί JWT authentication.

Μετά από επιτυχημένο login, το backend επιστρέφει token:

```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "user_id": 1,
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

Τα προστατευμένα requests πρέπει να περιλαμβάνουν το token στο header:

```http
Authorization: Bearer jwt_token_here
```

---

## Έλεγχος με Postman

### Register

```http
POST http://localhost:5000/auth/register
```

Body:

```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "123456"
}
```

Αναμενόμενο response:

```json
{
  "message": "User created",
  "userId": 1
}
```

---

### Login

```http
POST http://localhost:5000/auth/login
```

Body:

```json
{
  "email": "testuser@example.com",
  "password": "123456"
}
```

Αναμενόμενο response:

```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "user_id": 1,
    "name": "Test User",
    "email": "testuser@example.com"
  }
}
```

---

### Get Theatres

```http
GET http://localhost:5000/theatres
```

---

### Get Shows

```http
GET http://localhost:5000/shows
```

---

### Get Showtimes

```http
GET http://localhost:5000/showtimes?showId=1
```

---

### Get Seats

```http
GET http://localhost:5000/seats/1
```

---

### Create Reservation

```http
POST http://localhost:5000/reservations
```

Authorization:

```http
Bearer Token
```

Body:

```json
{
  "showtime_id": 1,
  "seats": [1, 2]
}
```

Αναμενόμενο response:

```json
{
  "message": "Reservation created successfully",
  "reservationId": 1
}
```

---

### Get My Reservations

```http
GET http://localhost:5000/reservations/my
```

Authorization:

```http
Bearer Token
```

---

### Cancel Reservation

```http
DELETE http://localhost:5000/reservations/1
```

Authorization:

```http
Bearer Token
```

---

## Frontend Design

Το frontend έχει θεατρική αισθητική και περιλαμβάνει:

- σκούρο θεατρικό background,
- χρυσές λεπτομέρειες,
- κάρτες θεάτρων και παραστάσεων,
- εικόνες για τις παραστάσεις,
- επιλογή θέσεων με grid,
- διαφορετικά χρώματα για διαθέσιμες, επιλεγμένες και κρατημένες θέσεις,
- μηνύματα επιτυχίας και αποτυχίας,
- ενότητα κρατήσεων χρήστη.

---

## Screenshots

Τα screenshots μπορούν να μπουν στον φάκελο `screenshots`.

Προτεινόμενα screenshots:

```text
screenshots/login.png
screenshots/home.png
screenshots/shows.png
screenshots/booking.png
screenshots/reservations.png
```

Παράδειγμα χρήσης στο README:

```md
![Home Page](screenshots/home.png)
```

---

## Ασφάλεια

### Password Hashing

Τα passwords δεν αποθηκεύονται ως απλό κείμενο. Πριν αποθηκευτούν στη βάση γίνονται hash με bcrypt.

### JWT Authentication

Τα προστατευμένα endpoints απαιτούν έγκυρο JWT token.

Προστατευμένα endpoints:

```text
GET /auth/profile
POST /reservations
GET /reservations/my
DELETE /reservations/:id
```

### Environment Variables

Τα ευαίσθητα δεδομένα αποθηκεύονται στο `.env`.

Το πραγματικό `.env` δεν πρέπει να ανεβαίνει στο GitHub.

### Database Integrity

Η βάση χρησιμοποιεί primary keys, foreign keys και ενδιάμεσο πίνακα για τη σωστή διαχείριση των σχέσεων μεταξύ των δεδομένων.

---

## Λογική Κράτησης

Η δημιουργία κράτησης ακολουθεί τα παρακάτω βήματα:

1. Έλεγχος των δεδομένων που στάλθηκαν από τον χρήστη.
2. Έλεγχος ότι υπάρχει το συγκεκριμένο showtime.
3. Έλεγχος ότι οι θέσεις ανήκουν στο συγκεκριμένο showtime.
4. Έλεγχος ότι οι θέσεις δεν είναι ήδη κρατημένες.
5. Υπολογισμός συνολικής τιμής.
6. Δημιουργία εγγραφής στον πίνακα `reservations`.
7. Εισαγωγή των επιλεγμένων θέσεων στον πίνακα `reservation_seats`.
8. Ενημέρωση των θέσεων ως κρατημένων.
9. Επιστροφή του reservation id στον χρήστη.

Η ακύρωση κράτησης αλλάζει την κατάσταση της κράτησης και ελευθερώνει τις αντίστοιχες θέσεις.

---

## Troubleshooting

### Το npm δεν αναγνωρίζεται

Εγκατάσταση Node.js και άνοιγμα νέου terminal:

```bash
node -v
npm -v
```

---

### Το backend δεν συνδέεται με τη βάση

Έλεγχοι:

- Η MariaDB πρέπει να τρέχει.
- Το `.env` πρέπει να έχει σωστό password.
- Το `DB_NAME` πρέπει να είναι `theatre_booking`.
- Το `database.sql` πρέπει να έχει εκτελεστεί σωστά.

---

### Το frontend δεν εμφανίζει δεδομένα

Έλεγχοι:

- Το backend πρέπει να τρέχει στο port 5000.
- Το frontend πρέπει να τρέχει στο port 5173.
- Το `frontend/src/api.js` πρέπει να έχει σωστό base URL:

```js
baseURL: 'http://localhost:5000'
```

---

### Δεν εμφανίζεται token

Μετά το login, το token φαίνεται στο Chrome DevTools:

```text
F12 → Application → Local Storage → http://localhost:5173
```

Το key είναι:

```text
token
```

---

## Μελλοντικές Βελτιώσεις

Πιθανές βελτιώσεις:

- Υλοποίηση React Native / Expo mobile εφαρμογής.
- Προσθήκη refresh token.
- Ασφαλέστερη αποθήκευση token.
- Δυνατότητα τροποποίησης υπάρχουσας κράτησης.
- Admin panel για διαχείριση θεάτρων, παραστάσεων και showtimes.
- Διαφορετικές κατηγορίες θέσεων με διαφορετικές τιμές.
- Email επιβεβαίωσης κράτησης.
- Ενσωμάτωση πληρωμών.
- Pagination και περισσότερα φίλτρα αναζήτησης.
- Καλύτερος μηχανισμός locking για ταυτόχρονες κρατήσεις.
- Automated tests.
- Docker setup.

---

## Στοιχεία Εργασίας

**Μάθημα:** Mobile & Distributed Systems  
**Κωδικός Μαθήματος:** CN6035  
**Τίτλος:** Theatre Seat Booking Application  
**Τεχνολογίες:** React, Node.js, Express, MariaDB, JWT  
**Αρχιτεκτονική:** Frontend Client - REST API - Database  

---

## Συμπέρασμα

Το Theatre Booking System υλοποιεί μια πλήρη ροή κράτησης θέσεων για θεατρικές παραστάσεις. Συνδυάζει frontend αλληλεπίδραση, backend λογική, authentication και αποθήκευση δεδομένων σε σχεσιακή βάση.

Η εφαρμογή δείχνει τις βασικές αρχές ενός κατανεμημένου συστήματος, καθώς περιλαμβάνει επικοινωνία μέσω REST API, έλεγχο ταυτότητας χρήστη, διαχείριση δεδομένων και λειτουργίες κρατήσεων.
