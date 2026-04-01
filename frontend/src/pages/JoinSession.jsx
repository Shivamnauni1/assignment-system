import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, CheckCircle } from '../components/Icons';

export default function JoinSession() {
  const { code } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [msg, setMsg] = useState('');
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    api.get(`/sessions/join/${code}`).then(r => setSession(r.data))
      .catch(() => setMsg('Invalid or expired join link'));
  }, [code]);

  const join = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'student') return setMsg('Only students can join sessions');
    setJoining(true);
    try {
      await api.post(`/sessions/join/${code}`);
      setJoined(true);
      setTimeout(() => navigate('/student'), 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to join');
    } finally { setJoining(false); }
  };

  if (msg) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-500 mb-6">{msg}</p>
        <Link to="/login"><button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition">Go to Login</button></Link>
      </div>
    </div>
  );

  if (joined) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Joined!</h2>
        <p className="text-gray-500">Redirecting to your dashboard...</p>
      </div>
    </div>
  );

  if (!session) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
      <div className="text-white text-center"><div className="text-4xl mb-3 animate-pulse">📚</div><p>Loading session...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full" />
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10">
            <BookOpen size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white relative z-10">You're invited!</h2>
          <p className="text-indigo-200 text-sm mt-1 relative z-10">Join this learning session</p>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-bold text-gray-800 text-center mb-1">{session.name}</h3>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mt-3 mb-6">
            <span className="flex items-center gap-1"><Users size={14} /> {session.teacher?.name}</span>
            <span>·</span>
            <span>Ends {new Date(session.endDate).toLocaleDateString()}</span>
          </div>

          {!user && (
            <div className="space-y-3">
              <Link to="/login"><button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition shadow-md shadow-indigo-200">Login to Join</button></Link>
              <Link to="/register"><button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition">Register & Join</button></Link>
            </div>
          )}
          {user?.role === 'student' && (
            <button onClick={join} disabled={joining}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition shadow-md shadow-indigo-200">
              {joining ? 'Joining...' : 'Join Session 🚀'}
            </button>
          )}
          {user && user.role !== 'student' && (
            <p className="text-center text-sm text-red-500 bg-red-50 py-3 rounded-xl">Only students can join sessions.</p>
          )}
        </div>
      </div>
    </div>
  );
}
