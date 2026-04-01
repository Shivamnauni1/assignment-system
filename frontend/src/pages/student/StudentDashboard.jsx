import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { Plus, BookOpen, Users, ChevronRight } from '../../components/Icons';

export default function StudentDashboard() {
  const { user } = useAuth();
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

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profileLink="/student/profile" />

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-indigo-200 text-sm font-medium mb-1">{greeting()},</p>
          <h1 className="text-3xl font-bold mb-1">{user.name} 👋</h1>
          <p className="text-indigo-200">You're enrolled in {sessions.length} session{sessions.length !== 1 ? 's' : ''}.</p>

          <div className="grid grid-cols-3 gap-4 mt-6 max-w-lg">
            {[
              { label: 'Sessions', value: sessions.length, icon: '📚' },
              { label: 'Active', value: sessions.filter(s => s.isActive).length, icon: '✅' },
              { label: 'Ending Soon', value: sessions.filter(s => { const d = new Date(s.endDate); const now = new Date(); return (d - now) < 30*24*60*60*1000; }).length, icon: '⏰' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-indigo-200 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Join session */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Plus size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Join a Session</h2>
              <p className="text-xs text-gray-400">Paste the join code shared by your teacher</p>
            </div>
          </div>
          <form onSubmit={joinSession} className="flex gap-3">
            <input className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
              placeholder="Enter join code (e.g. a1b2c3d4-...)" value={joinCode}
              onChange={e => setJoinCode(e.target.value)} required />
            <button type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition shadow-md shadow-indigo-200 whitespace-nowrap">
              Join Session
            </button>
          </form>
          {msg && (
            <div className={`mt-3 text-sm px-4 py-2 rounded-lg ${msgType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {msg}
            </div>
          )}
        </div>

        {/* Sessions grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">My Sessions</h2>
          <span className="text-sm text-gray-400">{sessions.length} total</span>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="font-semibold text-gray-700 mb-1">No sessions yet</h3>
            <p className="text-gray-400 text-sm">Ask your teacher for a join code to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sessions.map((s, i) => {
              const colors = [
                'from-indigo-500 to-purple-600',
                'from-pink-500 to-rose-600',
                'from-emerald-500 to-teal-600',
                'from-amber-500 to-orange-600',
                'from-blue-500 to-cyan-600',
              ];
              const color = colors[i % colors.length];
              const daysLeft = Math.max(0, Math.ceil((new Date(s.endDate) - new Date()) / (1000*60*60*24)));
              return (
                <div key={s._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group">
                  <div className={`bg-gradient-to-r ${color} p-5 relative overflow-hidden`}>
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
                    <div className="absolute -right-2 -bottom-6 w-28 h-28 bg-white/10 rounded-full" />
                    <BookOpen size={24} className="text-white/80 mb-3 relative z-10" />
                    <h3 className="font-bold text-white text-lg relative z-10 leading-tight">{s.name}</h3>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-500">{s.teacher?.name?.[0]}</span>
                      </div>
                      <span className="text-sm text-gray-600">{s.teacher?.name}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${daysLeft > 30 ? 'bg-green-100 text-green-700' : daysLeft > 7 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(s.endDate).toLocaleDateString()}</span>
                    </div>
                    <Link to={`/student/session/${s._id}`}>
                      <button className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-indigo-600 hover:text-white text-gray-700 text-sm py-2.5 rounded-xl font-semibold transition group-hover:bg-indigo-600 group-hover:text-white">
                        View Assignments <ChevronRight size={14} />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
