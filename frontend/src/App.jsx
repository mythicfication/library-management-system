import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Books from './pages/Books.jsx';
import BookDetails from './pages/BookDetails.jsx';
import MyBorrows from './pages/MyBorrows.jsx';
import Seats from './pages/Seats.jsx';
import Profile from './pages/Profile.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminBooks from './pages/AdminBooks.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="/my-borrows" element={<MyBorrows />} />
          <Route path="/seats" element={<Seats />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
        {/* AdminBooks is under generic protection; the page itself allows librarian + admin only */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/books" element={<AdminBooks />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
