import { Link } from 'react-router-dom';
export default function NotFound() {
  return <div className="card"><h2>404 — Page not found</h2><p>That page does not exist.</p><Link to="/">← Back home</Link></div>;
}
