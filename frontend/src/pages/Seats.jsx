import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Spinner from '../components/common/Spinner';
import { formatDate, todayISO } from '../utils/formatDate';

const SLOTS = ['Morning', 'Afternoon', 'Evening', 'Full Day'];

export default function Seats() {
  const [seats, setSeats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(todayISO());
  const [floor, setFloor] = useState('');
  const [slot, setSlot] = useState('Morning');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ date }); if (floor) q.set('floor', floor);
      const [s, b] = await Promise.all([api.get(`/seats?${q}`), api.get('/seats/my-bookings')]);
      setSeats(s.data.data); setBookings(b.data.data);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to load seats'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [date, floor]);

  const isBooked = (seat) => seat.bookedSlots?.includes('Full Day') || seat.bookedSlots?.includes(slot);
  const book = async () => {
    if (!selected) return toast.error('Pick a seat first');
    try { await api.post('/seats/book', { seatId: selected, date, timeSlot: slot }); toast.success('Seat booked!'); setSelected(null); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Booking failed'); }
  };
  const cancel = async (id) => {
    try { await api.delete(`/seats/bookings/${id}`); toast.success('Booking cancelled'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Cancel failed'); }
  };
  if (loading) return <Spinner />;
  return (
    <div>
      <h2>Study Seats — 30 seats</h2>
      <p className="muted">Floor 1: seats 1–15 (Reading Hall A) · Floor 2: seats 16–30 (Reading Hall B) · Long shared tables.</p>
      <div className="toolbar">
        <input type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} />
        <select value={floor} onChange={(e) => setFloor(e.target.value)}>
          <option value="">Both floors</option><option value="1">Floor 1</option><option value="2">Floor 2</option>
        </select>
        <select value={slot} onChange={(e) => setSlot(e.target.value)}>{SLOTS.map((s) => <option key={s}>{s}</option>)}</select>
        <button className="btn secondary" disabled={!selected} onClick={book}>Book selected seat</button>
      </div>
      <div className="seat-grid">
        {seats.map((s) => {
          const booked = isBooked(s);
          return <button key={s._id} className={`seat ${booked ? 'booked' : ''} ${selected === s._id ? 'selected' : ''}`} disabled={booked || !s.isAvailable} onClick={() => setSelected(s._id)}>
            Seat {s.seatNumber}<br /><small>Floor {s.floor}</small>
          </button>;
        })}
      </div>
      <h3>My bookings</h3>
      {bookings.length === 0 ? <p className="empty">No bookings yet.</p> :
        bookings.map((b) => <div className="card" key={b._id}><p>Seat {b.seat?.seatNumber} (Floor {b.seat?.floor}) · {formatDate(b.date)} · {b.timeSlot} · <span className="badge">{b.status}</span></p>
          {b.status === 'booked' && <button className="btn danger" onClick={() => { if (window.confirm('Cancel this booking?')) cancel(b._id); }}>Cancel</button>}</div>)}
    </div>
  );
}
