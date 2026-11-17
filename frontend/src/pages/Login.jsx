import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('student@demo.com');
  const [password, setPassword] = useState('Student@123');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await login(email, password); toast.success('Welcome back!'); navigate('/'); }
    catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };
  return (
    <div className="card" style={{ maxWidth: 420, margin: '3rem auto' }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label><input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <label><input type="checkbox" checked={show} onChange={() => setShow(!show)} style={{ width: 'auto' }} /> Show password</label>
        <button className="btn" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p className="muted">No account? <Link to="/register">Register</Link></p>
      <p className="muted">Demo: student@demo.com / Student@123 (run <code>npm run seed</code> first)</p>
    </div>
  );
}
