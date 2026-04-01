import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  useEffect(() => {
    api.get('/sessions/enrolled').then(r => setSessions(r.data));
  }, []);

  const joinSession = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/sessions/join/${joinCode}`);
      setMsg('Joined successfully!'); setMsgType('success');
      const r = await api.get('/sessions/enrolled');
      setSessions(r.data);
      setJoinCode('');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to join'); setMsgType('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">Assignment Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">👋 {user.name}</span>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">Student</span>
          <Link to="/student/profile">
            <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm px-4 py-2 rounded-lg transition font-semibold">My Profile</button>
          </Link>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Join a Session</h2>
          <form onSubmit={joinSession} className="flex gap-3">
            <input className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter join code or paste link code" value={joinCode}
              onChange={e => setJoinCode(e.target.value)} required />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">Join</button>
          </form>
          {msg && <p className={`mt-2 text-sm ${msgType === 'success' ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-3">My Sessions</h2>
        {sessions.length === 0
          ? <p className="text-gray-400 text-sm">No sessions yet. Join one above.</p>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map(s => (
                <div key={s._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                  <h3 className="font-semibold text-gray-800 mb-1">{s.name}</h3>
                  <p className="text-sm text-gray-500 mb-1">Teacher: {s.teacher?.name}</p>
                  <p className="text-xs text-gray-400 mb-4">Ends: {new Date(s.endDate).toLocaleDateString()}</p>
                  <Link to={`/student/session/${s._id}`}>
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg font-semibold transition">View Assignments</button>
                  </Link>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}
