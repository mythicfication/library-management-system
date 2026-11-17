import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [preview, setPreview] = useState(user?.avatar || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const save = async (e) => {
    e.preventDefault();
    try { await api.put('/users/profile', { name, avatar }); toast.success('Profile updated — log in again to see the new name'); }
    catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };
  const onAvatar = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setPreview(reader.result); setAvatar(reader.result); };
    reader.readAsDataURL(file);
  };
  const changePw = async (e) => {
    e.preventDefault();
    try { await api.put('/auth/change-password', { currentPassword, newPassword }); toast.success('Password changed'); setCurrentPassword(''); setNewPassword(''); }
    catch (err) { toast.error(err.response?.data?.message || 'Password change failed'); }
  };
  return (
    <div>
      <h2>Profile</h2>
      <div className="card">
        <p><strong>{user?.name}</strong> · {user?.email} · <span className="badge">{user?.role}</span></p>
        <form onSubmit={save}>
          <label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} required />
          <label>Avatar (image — preview below, stored as URL/data)</label>
          <input type="file" accept="image/*" onChange={onAvatar} />
          {preview && <img src={preview} alt="avatar preview" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '50%' }} />}
          <label>Avatar URL (optional)</label><input value={avatar} onChange={(e) => { setAvatar(e.target.value); setPreview(e.target.value); }} placeholder="https://..." />
          <button className="btn">Save profile</button>
        </form>
      </div>
      <div className="card">
        <h3>Change password</h3>
        <form onSubmit={changePw}>
          <label>Current password</label><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <label>New password (min 8 characters)</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
          <button className="btn">Change password</button>
        </form>
      </div>
    </div>
  );
}
