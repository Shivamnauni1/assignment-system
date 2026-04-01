import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-indigo-600 mb-1">Assignment Portal</h2>
        <p className="text-gray-500 mb-6">Create your account</p>
        {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Full Name" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Email" type="email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Password" type="password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />
          <select className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition">
            Register
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-indigo-600 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
