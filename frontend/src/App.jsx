import { useEffect, useMemo, useState } from 'react';
import api from './api';
import heroImage from './hero.png';
import './App.css';

// Εικόνα κάρτας με fallback όταν δεν υπάρχει διαθέσιμη εικόνα.
function CardImage({ src, alt, type = 'show' }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className={`card-image card-image-placeholder ${type}`}>
        <span className="card-image-icon">{type === 'theatre' ? '🎭' : '✨'}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="card-image"
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}

export default function App() {
  const [mode, setMode] = useState('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));

  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [seats, setSeats] = useState([]);
  const [reservations, setReservations] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');

  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);

  const login = async () => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setLoggedIn(true);
      setMessage('Η σύνδεση ολοκληρώθηκε με επιτυχία.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Η σύνδεση απέτυχε.');
    }
  };

  const signup = async () => {
    try {
      await api.post('/auth/register', { name, email, password });
      setMessage('Ο λογαριασμός δημιουργήθηκε. Μπορείς τώρα να συνδεθείς.');
      setMode('login');
      setName('');
      setPassword('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Η εγγραφή απέτυχε.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoggedIn(false);
    setTheatres([]);
    setShows([]);
    setShowtimes([]);
    setSeats([]);
    setReservations([]);
    setSelectedShow(null);
    setSelectedShowtime('');
    setSelectedSeats([]);
    setSearchTerm('');
    setMessage('Αποσυνδέθηκες από την εφαρμογή.');
  };

  const loadTheatres = async (term = searchTerm) => {
    try {
      const res = await api.get('/theatres', {
        params: { q: term || undefined },
      });
      setTheatres(res.data || []);
    } catch {
      setMessage('Δεν ήταν δυνατή η φόρτωση των θεάτρων.');
    }
  };

  const loadShows = async (term = searchTerm) => {
    try {
      const res = await api.get('/shows', {
        params: { q: term || undefined },
      });
      setShows(res.data || []);
    } catch {
      setMessage('Δεν ήταν δυνατή η φόρτωση των παραστάσεων.');
    }
  };

  const handleSearch = async () => {
    setSelectedShow(null);
    setSelectedShowtime('');
    setSeats([]);
    setSelectedSeats([]);
    setShowtimes([]);
    await loadTheatres(searchTerm);
    await loadShows(searchTerm);
  };

  const handleClear = async () => {
    setSearchTerm('');
    setSelectedShow(null);
    setSelectedShowtime('');
    setSeats([]);
    setSelectedSeats([]);
    setShowtimes([]);

    try {
      const [theatresRes, showsRes] = await Promise.all([
        api.get('/theatres'),
        api.get('/shows'),
      ]);
      setTheatres(theatresRes.data || []);
      setShows(showsRes.data || []);
    } catch {
      setMessage('Δεν ήταν δυνατή η επαναφορά της αναζήτησης.');
    }
  };

  const loadShowDetails = async (showId) => {
    try {
      const res = await api.get(`/shows/${showId}`);
      setSelectedShow(res.data);
      setSelectedShowtime('');
      setSeats([]);
      setSelectedSeats([]);
      setShowtimes([]);
      await loadShowtimes(showId);

      // Κατεβάζει τον χρήστη στη φόρμα επιλογής παράστασης.
      setTimeout(() => {
        document.getElementById('details-anchor')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Δεν φορτώθηκαν οι λεπτομέρειες της παράστασης.');
    }
  };

  const loadShowtimes = async (showIdParam) => {
    try {
      const showId = showIdParam || selectedShow?.show_id;
      if (!showId) return;

      const res = await api.get('/showtimes', {
        params: { showId },
      });

      setShowtimes(res.data || []);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Δεν φορτώθηκαν οι ώρες προβολής.');
    }
  };

  const loadSeats = async (showtimeId) => {
    try {
      const res = await api.get(`/seats/${showtimeId}`);
      setSeats(res.data || []);
      setSelectedSeats([]);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Δεν φορτώθηκαν οι θέσεις.');
    }
  };

  const loadReservations = async () => {
    try {
      const res = await api.get('/reservations/my');
      setReservations(res.data || []);
    } catch {
      setMessage('Δεν φορτώθηκαν οι κρατήσεις σου.');
    }
  };

  const toggleSeat = (seat) => {
    if (seat.is_reserved) return;

    setSelectedSeats((prev) =>
      prev.includes(seat.seat_id)
        ? prev.filter((id) => id !== seat.seat_id)
        : [...prev, seat.seat_id]
    );
  };

  const createReservation = async () => {
    try {
      const res = await api.post('/reservations', {
        showtime_id: Number(selectedShowtime),
        seats: selectedSeats,
      });

      setMessage(`Η κράτηση ολοκληρώθηκε με επιτυχία. Κωδικός: ${res.data.reservationId}`);
      await loadSeats(selectedShowtime);
      await loadReservations();
      setSelectedSeats([]);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Η κράτηση απέτυχε.');
    }
  };

  const cancelReservation = async (reservationId) => {
    try {
      await api.delete(`/reservations/${reservationId}`);
      setMessage('Η κράτηση ακυρώθηκε με επιτυχία.');

      setReservations((prev) =>
        prev.filter((r) => r.reservation_id !== reservationId)
      );

      if (selectedShowtime) await loadSeats(selectedShowtime);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Η ακύρωση απέτυχε.');
    }
  };

  useEffect(() => {
    if (loggedIn) {
      loadTheatres();
      loadShows();
      loadReservations();
    }
  }, [loggedIn]);

  const groupedReservations = useMemo(() => {
    const map = {};

    reservations.forEach((r) => {
      if (!map[r.reservation_id]) {
        map[r.reservation_id] = {
          reservation_id: r.reservation_id,
          show_title: r.show_title,
          show_date: r.show_date,
          show_time: r.show_time,
          status: r.status,
          total_price: r.total_price,
          seats: [],
        };
      }

      if (r.row_label && r.seat_number) {
        map[r.reservation_id].seats.push(`${r.row_label}${r.seat_number}`);
      }
    });

    return Object.values(map);
  }, [reservations]);

  const activeReservations = groupedReservations.filter((r) => r.status === 'active');

  return (
    <div className="page">
      <div className="stage-glow" />
      <div className="curtain curtain-left" />
      <div className="curtain curtain-right" />

      <div className="container">
        <header className="hero-section">
          <nav className="nav-bar">
            <div className="brand-mark">
              <span className="brand-icon">🎭</span>
              <span>Theatre Royal</span>
            </div>
            {loggedIn && (
              <button className="btn btn-ghost" onClick={logout}>Αποσύνδεση</button>
            )}
          </nav>

          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Online κρατήσεις θεατρικών θέσεων</span>
              <h1 className="title">Ζήσε τη μαγεία της σκηνής από την πρώτη σειρά.</h1>
              <p className="subtitle">
                Ανακάλυψε θέατρα, βρες παραστάσεις, διάλεξε ώρα και κράτησε τις θέσεις σου με λίγα κλικ.
              </p>
              {loggedIn && (
                <div className="hero-actions">
                  <button className="btn btn-primary" onClick={() => document.getElementById('shows-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    Δες παραστάσεις
                  </button>
                  <button className="btn btn-secondary" onClick={() => document.getElementById('reservations-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    Οι κρατήσεις μου
                  </button>
                </div>
              )}
            </div>

            <div className="hero-card">
              <img src={heroImage} alt="Theatre stage decoration" className="hero-art" />
              <div className="ticket-preview">
                <span>Premium Theatre Pass</span>
                <strong>Book your seat</strong>
              </div>
            </div>
          </div>
        </header>

        {!loggedIn ? (
          <section className="auth-layout">
            <div className="auth-intro card ornate-card">
              <span className="eyebrow">Καλώς ήρθες</span>
              <h2>Η προσωπική σου είσοδος στον κόσμο του θεάτρου</h2>
              <p>
                Συνδέσου ή δημιούργησε λογαριασμό για να δεις διαθέσιμες παραστάσεις, θέσεις και κρατήσεις.
              </p>
              <div className="mini-stats">
                <span><strong>3</strong> Θέατρα</span>
                <span><strong>4</strong> Παραστάσεις</span>
                <span><strong>120</strong> Θέσεις</span>
              </div>
            </div>

            <div className="card auth-box ornate-card">
              <div className="mode-switch">
                <button
                  className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setMode('login'); setMessage(''); }}
                >
                  Σύνδεση
                </button>
                <button
                  className={`btn ${mode === 'signup' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setMode('signup'); setMessage(''); }}
                >
                  Εγγραφή
                </button>
              </div>

              <h2 className="section-title">{mode === 'login' ? 'Σύνδεση χρήστη' : 'Δημιουργία λογαριασμού'}</h2>

              {mode === 'signup' && (
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ονοματεπώνυμο"
                />
              )}

              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />

              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Κωδικός πρόσβασης"
              />

              {mode === 'login' ? (
                <button className="btn btn-primary btn-block" onClick={login}>Μπες στην πλατεία</button>
              ) : (
                <button className="btn btn-primary btn-block" onClick={signup}>Δημιουργία λογαριασμού</button>
              )}

              {message && <div className="message">{message}</div>}
            </div>
          </section>
        ) : (
          <>
            <section className="card section search-panel ornate-card">
              <div>
                <span className="eyebrow">Αναζήτηση</span>
                <h2 className="section-title">Βρες την επόμενη παράσταση</h2>
              </div>
              <div className="toolbar">
                <input
                  className="input search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Αναζήτηση με πόλη, θέατρο ή τίτλο παράστασης"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="btn btn-primary" onClick={handleSearch}>Αναζήτηση</button>
                <button className="btn btn-secondary" onClick={handleClear}>Καθαρισμός</button>
              </div>
            </section>

            <section className="section">
              <div className="section-heading">
                <span className="eyebrow">Σκηνές</span>
                <h2 className="section-title">Θέατρα</h2>
              </div>
              {theatres.length === 0 ? (
                <p className="empty-state">Δεν βρέθηκαν θέατρα.</p>
              ) : (
                <div className="grid">
                  {theatres.map((theatre) => (
                    <article key={theatre.theatre_id} className="card media-card theatre-card">
                      <CardImage src={theatre.image_url} alt={theatre.name} type="theatre" />
                      <div className="card-body">
                        <span className="card-kicker">Θέατρο</span>
                        <h3>{theatre.name}</h3>
                        <p className="meta"><span className="meta-icon">📍</span> {theatre.location}</p>
                        {theatre.description && <p className="description">{theatre.description}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="section" id="shows-section">
              <div className="section-heading">
                <span className="eyebrow">Ρεπερτόριο</span>
                <h2 className="section-title">Παραστάσεις</h2>
              </div>
              {shows.length === 0 ? (
                <p className="empty-state">Δεν βρέθηκαν παραστάσεις.</p>
              ) : (
                <div className="grid">
                  {shows.map((show) => (
                    <article key={show.show_id} className="card media-card show-card">
                      <CardImage src={show.image_url} alt={show.title} type="show" />
                      <div className="card-body">
                        <span className="card-kicker">Παράσταση</span>
                        <h3>{show.title}</h3>
                        <p className="meta"><span className="meta-icon">🎭</span> {show.theatre_name}</p>
                        <p className="meta"><span className="meta-icon">📍</span> {show.location}</p>
                        <div className="badges">
                          <span className="badge">⏱ {show.duration} λεπτά</span>
                          <span className="badge">{show.age_rating}</span>
                        </div>
                        <button className="btn btn-primary btn-block" onClick={() => loadShowDetails(show.show_id)}>
                          Λεπτομέρειες & κράτηση
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <div id="details-anchor" />

            {selectedShow && (
              <section className="card details-box ornate-card">
                {selectedShow.image_url && (
                  <div className="details-hero-wrap">
                    <img src={selectedShow.image_url} alt={selectedShow.title} className="details-hero" />
                    <div className="details-overlay">
                      <span>Now booking</span>
                      <strong>{selectedShow.title}</strong>
                    </div>
                  </div>
                )}

                <div className="details-body">
                  <span className="eyebrow">Λεπτομέρειες παράστασης</span>
                  <h2 className="details-title">{selectedShow.title}</h2>
                  {selectedShow.description && <p className="description lead-text">{selectedShow.description}</p>}

                  <div className="details-meta">
                    <p><strong>Θέατρο:</strong> {selectedShow.theatre_name}</p>
                    <p><strong>Πόλη:</strong> {selectedShow.location}</p>
                    <p><strong>Διάρκεια:</strong> {selectedShow.duration} λεπτά</p>
                    <p><strong>Ηλικιακή ένδειξη:</strong> {selectedShow.age_rating}</p>
                  </div>

                  <h3 className="section-title small-title">Διαθέσιμες ώρες</h3>
                  <select
                    className="select"
                    value={selectedShowtime}
                    onChange={(e) => {
                      setSelectedShowtime(e.target.value);
                      if (e.target.value) loadSeats(e.target.value);
                      else setSeats([]);
                    }}
                  >
                    <option value="">Επίλεξε ημέρα και ώρα</option>
                    {showtimes.map((st) => (
                      <option key={st.showtime_id} value={st.showtime_id}>
                        #{st.showtime_id} — {String(st.show_date).slice(0, 10)} {st.show_time} | {st.hall_name} | €{st.base_price}
                      </option>
                    ))}
                  </select>

                  {showtimes.length === 0 && <p className="empty-state">Δεν υπάρχουν διαθέσιμες ώρες.</p>}

                  {selectedShowtime && (
                    <>
                      <h3 className="section-title small-title">Επιλογή θέσεων</h3>
                      <div className="stage-label">ΣΚΗΝΗ</div>
                      <div className="seat-legend">
                        <span><span className="legend-swatch available"></span> Διαθέσιμη</span>
                        <span><span className="legend-swatch selected"></span> Επιλεγμένη</span>
                        <span><span className="legend-swatch reserved"></span> Κρατημένη</span>
                      </div>

                      <div className="seat-grid">
                        {seats.map((seat) => {
                          const isSelected = selectedSeats.includes(seat.seat_id);
                          const seatClass = seat.is_reserved
                            ? 'seat reserved'
                            : isSelected
                              ? 'seat selected'
                              : 'seat available';

                          return (
                            <button
                              key={seat.seat_id}
                              className={seatClass}
                              onClick={() => toggleSeat(seat)}
                              disabled={seat.is_reserved}
                            >
                              {seat.row_label}{seat.seat_number}
                            </button>
                          );
                        })}
                      </div>

                      <div className="booking-bar">
                        <div className="booking-summary">
                          {selectedSeats.length > 0 ? (
                            <span>{selectedSeats.length} επιλεγμένες θέσεις</span>
                          ) : (
                            <span className="muted">Δεν έχεις επιλέξει θέσεις</span>
                          )}
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={createReservation}
                          disabled={!selectedShowtime || selectedSeats.length === 0}
                        >
                          Ολοκλήρωση κράτησης
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            {message && <div className="message floating-message">{message}</div>}

            <section className="section" id="reservations-section">
              <div className="section-heading">
                <span className="eyebrow">Προφίλ χρήστη</span>
                <h2 className="section-title">Οι κρατήσεις μου</h2>
              </div>
              {activeReservations.length === 0 ? (
                <p className="empty-state">Δεν υπάρχουν ενεργές κρατήσεις.</p>
              ) : (
                <div className="reservation-list">
                  {activeReservations.map((r) => (
                    <article key={r.reservation_id} className="card reservation-item ornate-card">
                      <div className="reservation-header">
                        <div>
                          <span className="card-kicker">Ενεργή κράτηση</span>
                          <h3>{r.show_title}</h3>
                        </div>
                        <span className="reservation-id">#{r.reservation_id}</span>
                      </div>
                      <p><strong>📅 Ημερομηνία:</strong> {String(r.show_date).slice(0, 10)} {r.show_time}</p>
                      <p><strong>💺 Θέσεις:</strong> {r.seats.length ? r.seats.join(', ') : 'Καμία'}</p>
                      <p><strong>💶 Σύνολο:</strong> €{r.total_price}</p>
                      <p><strong>Κατάσταση:</strong> <span className="status-active">{r.status}</span></p>
                      <button className="btn btn-danger" onClick={() => cancelReservation(r.reservation_id)}>
                        Ακύρωση κράτησης
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
