import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Competitive Exams', 'Children', 'Other'];
const empty = { title: '', author: '', isbn: '', category: 'Fiction', description: '', totalCopies: 1, publishedYear: '', shelfLocation: '' };

export default function AdminBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cover, setCover] = useState(null);

  const load = () => api.get('/books?limit=50').then((r) => setBooks(r.data.data))
    .catch((e) => toast.error(e.response?.data?.message || 'Failed to load books'))
    .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  if (user && user.role !== 'admin' && user.role !== 'librarian') return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, totalCopies: Number(form.totalCopies), publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined };
      let id = editing;
      if (editing) { await api.put(`/books/${editing}`, payload); toast.success('Book updated'); }
      else { const { data } = await api.post('/books', payload); id = data.data._id; toast.success('Book created'); }
      if (cover && id) {
        const fd = new FormData(); fd.append('file', cover);
        await api.post(`/books/${id}/cover`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setForm(empty); setEditing(null); setCover(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };
  const edit = (b) => { setEditing(b._id); setForm({ title: b.title, author: b.author, isbn: b.isbn, category: b.category, description: b.description || '', totalCopies: b.totalCopies, publishedYear: b.publishedYear || '', shelfLocation: b.shelfLocation || '' }); };
  const remove = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try { await api.delete(`/books/${id}`); toast.success('Book deleted'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Delete failed'); }
  };
  if (loading) return <Spinner />;
  return (
    <div><h2>Manage Books</h2>
      <div className="card"><h3>{editing ? 'Edit book' : 'Add book'}</h3>
        <form onSubmit={submit}>
          <label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <label>Author</label><input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
          <label>ISBN</label><input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} required />
          <label>Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          <label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label>Total copies</label><input type="number" min="1" value={form.totalCopies} onChange={(e) => setForm({ ...form, totalCopies: e.target.value })} />
          <label>Published year</label><input type="number" value={form.publishedYear} onChange={(e) => setForm({ ...form, publishedYear: e.target.value })} />
          <label>Shelf location</label><input value={form.shelfLocation} onChange={(e) => setForm({ ...form, shelfLocation: e.target.value })} placeholder="Floor 1, Shelf A1" />
          <label>Cover image (JPG/PNG, max 2 MB)</label><input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] || null)} />
          <button className="btn">{editing ? 'Update' : 'Add book'}</button>
          {editing && <button type="button" className="btn" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}
        </form>
      </div>
      {books.map((b) => <div className="card" key={b._id}><strong>{b.title}</strong> — {b.author} · <span className="badge">{b.availableCopies}/{b.totalCopies}</span>
        <p><button className="btn" onClick={() => edit(b)}>Edit</button> <button className="btn danger" onClick={() => remove(b._id)}>Delete</button></p></div>)}
    </div>
  );
}
