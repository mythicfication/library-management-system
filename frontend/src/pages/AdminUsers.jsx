import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Spinner from '../components/common/Spinner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => api.get('/users?limit=50').then((r) => setUsers(r.data.data))
    .catch((e) => toast.error(e.response?.data?.message || 'Failed to load users'))
    .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const deactivate = async (id, name) => {
    if (!window.confirm(`Deactivate ${name}?`)) return;
    try { await api.delete(`/users/${id}`); toast.success('User deactivated'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };
  if (loading) return <Spinner />;
  return (
    <div><h2>Users (Admin)</h2>
      {users.length === 0 ? <p className="empty">No users.</p> :
        <table style={{ width: '100%' }}><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>{users.map((u) => <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td><span className="badge">{u.role}</span></td><td>{u.isActive ? 'Active' : 'Inactive'}</td>
            <td>{u.isActive && <button className="btn danger" onClick={() => deactivate(u._id, u.name)}>Deactivate</button>}</td></tr>)}</tbody></table>}
    </div>
  );
}
