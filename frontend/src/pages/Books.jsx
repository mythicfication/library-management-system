import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';

const CATEGORIES = ['', 'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Competitive Exams', 'Children', 'Other'];
let timer;

export default function Books() {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('-createdAt');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 10, sort });
      if (search) q.set('search', search);
      if (category) q.set('category', category);
      const { data } = await api.get(`/books?${q}`);
      setBooks(data.data); setPagination(data.pagination);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to load books'); }
    finally { setLoading(false); }
  }, [page, search, category, sort]);

  useEffect(() => { load(); }, [load]);

  const onSearch = (v) => { clearTimeout(timer); timer = setTimeout(() => { setSearch(v); setPage(1); }, 400); };

  const borrow = async (id, title) => {
    try { await api.post('/borrows', { bookId: id }); toast.success(`"${title}" issued for 14 days`); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Could not borrow'); }
  };

  return (
    <div>
      <h2>Books</h2>
      <div className="toolbar">
        <input placeholder="Search title / author..." onChange={(e) => onSearch(e.target.value)} />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'All categories'}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="-createdAt">Newest</option><option value="title">Title A–Z</option><option value="-title">Title Z–A</option>
        </select>
      </div>
      {loading ? <Spinner /> : books.length === 0 ? <p className="empty">No books found.</p> :
        books.map((b) => (
          <article className="card" key={b._id}>
            <h3><Link to={`/books/${b._id}`}>{b.title}</Link></h3>
            <p className="muted">{b.author} · {b.category} · {b.publishedYear || ''}</p>
            <p>{b.description}</p>
            <p><span className="badge">{b.availableCopies} / {b.totalCopies} available</span> {b.shelfLocation && <span className="muted"> · {b.shelfLocation}</span>}</p>
            <button className="btn secondary" disabled={b.availableCopies <= 0} onClick={() => borrow(b._id, b.title)}>
              {b.availableCopies <= 0 ? 'Not available' : 'Borrow'}
            </button>
          </article>
        ))}
      <Pagination pagination={pagination} onPage={setPage} />
    </div>
  );
}
