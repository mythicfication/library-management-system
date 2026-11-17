import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Spinner from '../components/common/Spinner';
import { formatDate } from '../utils/formatDate';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([api.get('/dashboard/stats'), api.get('/borrows/my')])
      .then(([s, b]) => { setStats(s.data.data); setBorrows(b.data.data.slice(0, 5)); })
      .catch((e) => toast.error(e.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return <p className="error">Could not load dashboard.</p>;
  return (
    <div>
      <h2>Welcome, {user?.name} 👋</h2>
      <p className="muted">Your library — 2 floors, 30 study seats, reception near the entrance.</p>
      <div className="grid">
        <div className="card"><div className="stat">{stats.totalBooks}</div><p>Total books</p></div>
        <div className="card"><div className="stat">{stats.availableBooks}</div><p>Copies available</p></div>
        <div className="card"><div className="stat">{stats.activeBorrows}</div><p>Books issued</p></div>
        <div className="card"><div className="stat">{stats.overdue}</div><p>Overdue</p></div>
        <div className="card"><div className="stat">{stats.seatsBookedToday}</div><p>Seats booked today / 30</p></div>
        <div className="card"><div className="stat">{stats.myBorrows}</div><p>My active borrows</p></div>
      </div>
      {stats.byCategory?.length > 0 && (
        <div className="card"><h3>Books by category</h3>
          {stats.byCategory.map((c) => <p key={c._id}>{c._id}: <strong>{c.count}</strong></p>)}
        </div>
      )}
      <div className="card"><h3>Recent borrows</h3>
        {borrows.length === 0 ? <p className="empty">No borrows yet. <Link to="/books">Browse books</Link></p> :
          borrows.map((b) => <p key={b._id}>{b.book?.title} — <span className="badge">{b.status}</span> due {formatDate(b.dueDate)}</p>)}
      </div>
    </div>
  );
}
