import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toggleDark = () => document.body.classList.toggle('dark');
  return (
    <nav className="navbar">
      <Link to="/"><strong>📚 Library</strong></Link>
      <Link to="/books">Books</Link>
      <Link to="/my-borrows">My Borrows</Link>
      <Link to="/seats">Seats</Link>
      {(user?.role === 'admin' || user?.role === 'librarian') && <Link to="/admin/books">Manage Books</Link>}
      {user?.role === 'admin' && <Link to="/admin/users">Users</Link>}
      <span className="spacer" />
      <button className="btn" onClick={toggleDark} title="Dark mode">🌙</button>
      {user ? (<><Link to="/profile">{user.name} ({user.role})</Link><button className="btn" onClick={() => { logout(); navigate('/login'); }}>Logout</button></>) : <Link to="/login">Login</Link>}
    </nav>
  );
}
