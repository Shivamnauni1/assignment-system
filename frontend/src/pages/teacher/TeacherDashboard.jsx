import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import { Plus, Users, BookOpen, Link2, ChevronRight } from '../../components/Icons';

export default function TeacherDashboard() {
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState('');
  const [msg, setMsg] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    api.get('/sessions/my').then(r => setSessions(r.data));
  }, []);

  const createSession = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/sessions', { name: newSession });
      setSessions([data, ...sessions]);
      setNewSession('');
      setShowCreate(false);
      setMsg(`Session "${data.name}" created!`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    }
  };

  const copyLink = (code) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  const totalStudents = sessions.reduce((a, s) => a + (s.students?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold mb-1">Teacher Dashboard</h1>
          <p className="text-blue-200 mb-6">Manage your sessions and track student progress.</p>
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            {[
              { label: 'Sessions', value: sessions.length, icon: '📚' },
              { label: 'Students', value: totalStudents, icon: '👥' },
              { label: 'Active', value: sessions.filter(s => s.isActive).length, icon: '✅' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-blue-200 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {msg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-5">{msg}</div>
        )}

        {/* Create session */}
        {!showCreate ? (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold transition shadow-md shadow-indigo-200 mb-8">
            <Plus size={18} /> Create New Session
          </button>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
            <h3 className="font-semibold text-gray-800 mb-4">New Session</h3>
            <form onSubmit={createSession} className="flex gap-3">
              <input className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
                placeholder="Session name (e.g. CS101 - Batch 2025)"
                value={newSession} onChange={e => setNewSession(e.target.value)} required autoFocus />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition">Create</button>
              <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-3 rounded-xl text-sm font-semibold transition">Cancel</button>
            </form>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">My Sessions</h2>
          <span className="text-sm text-gray-400">{sessions.length} total</span>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
            <div className="text-5xl mb-4">🏫</div>
            <h3 className="font-semibold text-gray-700 mb-1">No sessions yet</h3>
            <p className="text-gray-400 text-sm">Create your first session to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sessions.map((s, i) => {
              const colors = ['from-blue-500 to-indigo-600','from-violet-500 to-purple-600','from-teal-500 to-emerald-600','from-rose-500 to-pink-600','from-amber-500 to-orange-600'];
              const color = colors[i % colors.length];
              const daysLeft = Math.max(0, Math.ceil((new Date(s.endDate) - new Date()) / (1000*60*60*24)));
              return (
                <div key={s._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition">
                  <div className={`bg-gradient-to-r ${color} p-5 relative overflow-hidden`}>
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
                    <div className="absolute -right-2 -bottom-6 w-28 h-28 bg-white/10 rounded-full" />
                    <BookOpen size={22} className="text-white/80 mb-3 relative z-10" />
                    <h3 className="font-bold text-white text-lg relative z-10">{s.name}</h3>
                    <div className="flex items-center gap-2 mt-2 relative z-10">
                      <Users size={14} className="text-white/70" />
                      <span className="text-white/80 text-sm">{s.students?.length || 0} students</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${daysLeft > 30 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {daysLeft > 0 ? `${daysLeft}d left` : 'Ended'}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-xs font-mono bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 text-gray-500 truncate mb-3">{s.joinCode}</p>

                    <div className="flex gap-2">
                      <button onClick={() => copyLink(s.joinCode)}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl font-semibold transition ${copied === s.joinCode ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                        <Link2 size={12} /> {copied === s.joinCode ? 'Copied!' : 'Copy Link'}
                      </button>
                      <Link to={`/teacher/session/${s._id}`} className="flex-1">
                        <button className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 rounded-xl font-semibold transition">
                          Manage <ChevronRight size={12} />
                        </button>
                      </Link>
                    </div>
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
