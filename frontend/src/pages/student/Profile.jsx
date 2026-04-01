import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const SOCIAL_CONFIG = [
  { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/username', icon: '💼' },
  { key: 'github',    label: 'GitHub',    placeholder: 'https://github.com/username',      icon: '🐙' },
  { key: 'leetcode',  label: 'LeetCode',  placeholder: 'https://leetcode.com/username',    icon: '🧩' },
  { key: 'twitter',   label: 'Twitter/X', placeholder: 'https://twitter.com/username',     icon: '🐦' },
  { key: 'portfolio', label: 'Portfolio', placeholder: 'https://yoursite.com',             icon: '🌐' },
];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    api.get('/profile').then(r => {
      setProfile(r.data);
      setForm({
        name: r.data.name || '',
        bio: r.data.bio || '',
        phone: r.data.phone || '',
        department: r.data.department || '',
        rollNumber: r.data.rollNumber || '',
        batch: r.data.batch || '',
        skills: r.data.skills || [],
        socials: {
          linkedin: r.data.socials?.linkedin || '',
          github: r.data.socials?.github || '',
          leetcode: r.data.socials?.leetcode || '',
          twitter: r.data.socials?.twitter || '',
          portfolio: r.data.socials?.portfolio || '',
        },
      });
    });
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    const fd = new FormData();
    fd.append('avatar', avatarFile);
    const { data } = await api.post('/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setProfile(data);
    setAvatarFile(null);
    setAvatarPreview(null);
    setMsg('Avatar updated!'); setMsgType('success');
  };

  const addSkill = (e) => {
    e.preventDefault();
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) setForm({ ...form, skills: [...form.skills, s] });
    setSkillInput('');
  };

  const removeSkill = (skill) => setForm({ ...form, skills: form.skills.filter(s => s !== skill) });

  const handleSave = async () => {
    try {
      const { data } = await api.put('/profile', form);
      setProfile(data);
      setEditing(false);
      setMsg('Profile updated!'); setMsgType('success');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to update'); setMsgType('error');
    }
  };

  if (!profile) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Loading profile...</p>
    </div>
  );

  const avatarSrc = avatarPreview
    || (profile.avatar ? `http://localhost:5000/${profile.avatar}` : null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">Assignment Portal</h1>
        <Link to="/student">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg transition">← Dashboard</button>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto p-6 space-y-5">

        {/* Avatar + basic info card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-5">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-4 border-indigo-200">
                {avatarSrc
                  ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-3xl font-bold text-indigo-400">{profile.name?.[0]?.toUpperCase()}</span>
                }
              </div>
              <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer text-sm hover:bg-indigo-700">
                ✏️
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
              <p className="text-sm text-gray-500">{profile.email}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">Student</span>
                {profile.department && <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full">{profile.department}</span>}
                {profile.batch && <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">Batch {profile.batch}</span>}
              </div>
              {profile.bio && <p className="text-sm text-gray-600 mt-2">{profile.bio}</p>}
            </div>

            <button onClick={() => setEditing(!editing)}
              className={`text-sm px-4 py-2 rounded-lg font-semibold transition ${editing ? 'bg-gray-100 text-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {avatarFile && (
            <div className="mt-3 flex items-center gap-3">
              <p className="text-sm text-gray-500">New avatar selected: {avatarFile.name}</p>
              <button onClick={uploadAvatar} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1 rounded-lg font-semibold transition">Upload</button>
            </div>
          )}
        </div>

        {/* Edit form */}
        {editing && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 text-lg">Edit Profile</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Department</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="e.g. Computer Science" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Roll Number</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="e.g. CS2021001" value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Batch / Year</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="e.g. 2025" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Bio</label>
              <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                rows={3} placeholder="Tell something about yourself..." value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })} />
            </div>

            {/* Skills */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Skills</label>
              <form onSubmit={addSkill} className="flex gap-2 mb-2">
                <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Add a skill (e.g. Python, React)" value={skillInput}
                  onChange={e => setSkillInput(e.target.value)} />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">Add</button>
              </form>
              <div className="flex flex-wrap gap-2">
                {form.skills.map(s => (
                  <span key={s} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    {s}
                    <button onClick={() => removeSkill(s)} className="text-indigo-400 hover:text-red-500 ml-1 font-bold bg-transparent p-0 text-xs">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Social links */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block font-semibold">Social & Coding Profiles</label>
              <div className="space-y-2">
                {SOCIAL_CONFIG.map(({ key, label, placeholder, icon }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-lg w-7 text-center">{icon}</span>
                    <div className="flex-1">
                      <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder={placeholder}
                        value={form.socials[key]}
                        onChange={e => setForm({ ...form, socials: { ...form.socials, [key]: e.target.value } })} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleSave}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition">
              Save Profile
            </button>
          </div>
        )}

        {/* Stats card */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Roll Number', value: profile.rollNumber || '—' },
            { label: 'Department', value: profile.department || '—' },
            { label: 'Batch', value: profile.batch || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="font-semibold text-gray-800 text-sm">{value}</p>
            </div>
          ))}
        </div>

        {/* Skills display */}
        {profile.skills?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(s => (
                <span key={s} className="bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Social links display */}
        {Object.values(profile.socials || {}).some(v => v) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Profiles & Links</h3>
            <div className="space-y-2">
              {SOCIAL_CONFIG.filter(({ key }) => profile.socials?.[key]).map(({ key, label, icon }) => (
                <a key={key} href={profile.socials[key]} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                  <span className="text-xl">{icon}</span>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm text-indigo-600 group-hover:underline truncate max-w-xs">{profile.socials[key]}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {msg && (
          <p className={`text-sm text-center font-medium ${msgType === 'success' ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>
        )}
      </div>
    </div>
  );
}
