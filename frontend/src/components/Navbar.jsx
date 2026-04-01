import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, BookOpen } from './Icons';

const roleColors = {
  student: 'bg-amber-100 text-amber-700',
  teacher: 'bg-blue-100 text-blue-700',
  admin:   'bg-purple-100 text-purple-700',
};

export default function Navbar({ profileLink }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        <Link to={`/${user?.role}`} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-800 text-lg">EduPortal</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-600">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[user?.role]}`}>
              {user?.role}
            </span>
          </div>

          {profileLink && (
            <Link to={profileLink}>
              <button className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm px-3 py-1.5 rounded-full font-semibold transition">
                <User size={14} /> Profile
              </button>
            </Link>
          )}

          <button onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm px-3 py-1.5 rounded-full font-semibold transition">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
