import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [tab, setTab] = useState('users');

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data));
    api.get('/sessions').then(r => setSessions(r.data));
  }, []);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    setUsers(users.filter(u => u._id !== id));
  };

  const roleBadge = (role) => {
    const map = { admin: 'bg-purple-100 text-purple-700', teacher: 'bg-blue-100 text-blue-700', student: 'bg-yellow-100 text-yellow-700' };
    return <span className={`text-xs font-semibold px-2 py-1 rounded-full ${map[role]}`}>{role}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">Assignment Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">👋 {user.name}</span>
          <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">Admin</span>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex gap-2 mb-6">
          {['users', 'sessions'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition capitalize ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Role', 'Action'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3">{roleBadge(u.role)}</td>
                    <td className="px-5 py-3">
                      {u._id !== user.id && (
                        <button onClick={() => deleteUser(u._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-xs px-3 py-1 rounded-lg font-semibold transition">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'sessions' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Teacher', 'Students', 'End Date', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="px-5 py-3 text-gray-500">{s.teacher?.name}</td>
                    <td className="px-5 py-3 text-gray-500">{s.students?.length}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(s.endDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
