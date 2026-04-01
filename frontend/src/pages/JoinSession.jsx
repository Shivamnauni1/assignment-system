import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function JoinSession() {
  const { code } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get(`/sessions/join/${code}`).then(r => setSession(r.data))
      .catch(() => setMsg('Invalid or expired join link'));
  }, [code]);

  const join = async () => {
    if (!user) return navigate(`/login`);
    if (user.role !== 'student') return setMsg('Only students can join sessions');
    try {
      await api.post(`/sessions/join/${code}`);
      navigate('/student');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to join');
    }
  };

  if (msg) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <p className="text-red-600 font-medium">{msg}</p>
        <Link to="/login" className="text-indigo-600 text-sm mt-4 inline-block hover:underline">Go to Login</Link>
      </div>
    </div>
  );

  if (!session) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
      <p className="text-white">Loading session...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📚</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Join Session</h2>
        <h3 className="text-lg text-indigo-600 font-semibold mb-2">{session.name}</h3>
        <p className="text-sm text-gray-500 mb-1">Teacher: {session.teacher?.name}</p>
        <p className="text-xs text-gray-400 mb-6">Session ends: {new Date(session.endDate).toLocaleDateString()}</p>

        {!user && (
          <div className="space-y-2">
            <Link to="/login"><button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition">Login to Join</button></Link>
            <Link to="/register"><button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition">Register & Join</button></Link>
          </div>
        )}
        {user?.role === 'student' && (
          <button onClick={join} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition">
            Join Session
          </button>
        )}
        {user?.role !== 'student' && user && (
          <p className="text-sm text-red-500">Only students can join sessions.</p>
        )}
      </div>
    </div>
  );
}
