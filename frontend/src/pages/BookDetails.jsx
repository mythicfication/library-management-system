import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Spinner from '../components/common/Spinner';

export default function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get(`/books/${id}`).then((r) => setBook(r.data.data))
      .catch((e) => toast.error(e.response?.data?.message || 'Book not found'))
      .finally(() => setLoading(false));
  }, [id]);
  if (loading) return <Spinner />;
  if (!book) return <p className="empty">Book not found. <Link to="/books">Back to books</Link></p>;
  const borrow = async () => {
    try { await api.post('/borrows', { bookId: id }); toast.success('Book issued for 14 days'); }
    catch (e) { toast.error(e.response?.data?.message || 'Could not borrow'); }
  };
  return (
    <div className="card">
      <h2>{book.title}</h2>
      <p className="muted">{book.author} · {book.category} · ISBN {book.isbn} · {book.publishedYear || ''}</p>
      <p>{book.description}</p>
      <p><span className="badge">{book.availableCopies} / {book.totalCopies} available</span> {book.shelfLocation && <span> · {book.shelfLocation}</span>}</p>
      {book.coverImage && <img src={book.coverImage} alt={book.title} style={{ maxWidth: 200 }} />}
      <p><button className="btn secondary" disabled={book.availableCopies <= 0} onClick={borrow}>Borrow</button> <Link to="/books">← Back</Link></p>
    </div>
  );
}
