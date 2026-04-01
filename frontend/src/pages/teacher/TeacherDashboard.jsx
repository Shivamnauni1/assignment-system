import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/sessions/my').then(r => setSessions(r.data));
  }, []);

  const createSession = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/sessions', { name: newSession });
      setSessions([...sessions, data]);
      setNewSession('');
      setMsg(`Session created! Code: ${data.joinCode}`);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    }
  };

  const copyLink = (code) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
    setMsg('Join link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">Assignment Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">👋 {user.name}</span>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">Teacher</span>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Create New Session</h2>
          <form onSubmit={createSession} className="flex gap-3">
            <input className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Session name (e.g. CS101 - Batch 2025)"
              value={newSession} onChange={e => setNewSession(e.target.value)} required />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">Create</button>
          </form>
          {msg && <p className="mt-2 text-sm text-green-600">{msg}</p>}
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-3">My Sessions</h2>
        {sessions.length === 0
          ? <p className="text-gray-400 text-sm">No sessions yet. Create one above.</p>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map(s => (
                <div key={s._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                  <h3 className="font-semibold text-gray-800 mb-1">{s.name}</h3>
                  <p className="text-sm text-gray-500 mb-1">Students: {s.students?.length || 0}</p>
                  <p className="text-xs text-gray-400 mb-1">Ends: {new Date(s.endDate).toLocaleDateString()}</p>
                  <p className="text-xs font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1 mb-3 truncate">{s.joinCode}</p>
                  <div className="flex gap-2">
                    <button onClick={() => copyLink(s.joinCode)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-2 rounded-lg font-semibold transition">
                      Copy Link
                    </button>
                    <Link to={`/teacher/session/${s._id}`} className="flex-1">
                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 rounded-lg font-semibold transition">Manage</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}
