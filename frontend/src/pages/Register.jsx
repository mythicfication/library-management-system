import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try { await register(name, email, password); toast.success('Account created!'); navigate('/'); }
    catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };
  return (
    <div className="card" style={{ maxWidth: 420, margin: '3rem auto' }}>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        <label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password (min 8 characters)</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
      </form>
      <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
