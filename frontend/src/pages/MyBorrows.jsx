import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Spinner from '../components/common/Spinner';
import { formatDate } from '../utils/formatDate';

export default function MyBorrows() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => api.get('/borrows/my').then((r) => setBorrows(r.data.data))
    .catch((e) => toast.error(e.response?.data?.message || 'Failed to load borrows'))
    .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const returnBook = async (id) => {
    try { const { data } = await api.put(`/borrows/${id}/return`); toast.success(data.message); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Return failed'); }
  };
  if (loading) return <Spinner />;
  return (
    <div>
      <h2>My Borrows</h2>
      <p className="muted">Max 3 active borrows · 14 days each · Fine Rs 10/day if overdue.</p>
      {borrows.length === 0 ? <p className="empty">No borrows yet.</p> :
        borrows.map((b) => (
          <div className="card" key={b._id}>
            <h3>{b.book?.title}</h3>
            <p>Borrowed {formatDate(b.borrowedAt)} · Due {formatDate(b.dueDate)} {b.returnedAt && `· Returned ${formatDate(b.returnedAt)}`}</p>
            <p><span className="badge">{b.status}</span> {b.fine > 0 && <span className="error">Fine: Rs {b.fine}</span>}</p>
            {b.status !== 'returned' && <button className="btn" onClick={() => { if (window.confirm('Return this book?')) returnBook(b._id); }}>Return</button>}
          </div>
        ))}
    </div>
  );
}
