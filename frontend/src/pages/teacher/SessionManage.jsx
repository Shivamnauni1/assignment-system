import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import { Plus, FileText, ChevronRight, Upload } from '../../components/Icons';

export default function SessionManage() {
  const { sessionId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', deadline: '', maxScore: 100 });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get(`/assignments/session/${sessionId}`).then(r => setAssignments(r.data));
  }, [sessionId]);

  const createAssignment = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('sessionId', sessionId);
    if (file) fd.append('pdf', file);
    try {
      const { data } = await api.post('/assignments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAssignments([...assignments, data]);
      setForm({ title: '', description: '', deadline: '', maxScore: 100 });
      setFile(null); setShowForm(false);
      setMsg('Assignment created!'); setMsgType('success');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed'); setMsgType('error');
    }
  };

  const now = new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link to="/teacher" className="inline-flex items-center gap-1 text-indigo-600 text-sm hover:underline mb-6">← Back to Dashboard</Link>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-5 ${msgType === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>{msg}</div>
        )}

        {/* Create assignment toggle */}
        {!showForm ? (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold transition shadow-md shadow-indigo-200 mb-8">
            <Plus size={18} /> New Assignment
          </button>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
            <h3 className="font-bold text-gray-800 text-lg mb-5">Create Assignment</h3>
            <form onSubmit={createAssignment} className="space-y-4">
              <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
                placeholder="Assignment title" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required />
              <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition resize-none"
                placeholder="Description (optional)" rows={3} value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Deadline</label>
                  <input type="datetime-local" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
                    value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Max Score</label>
                  <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
                    value={form.maxScore} onChange={e => setForm({ ...form, maxScore: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Assignment PDF (optional)</label>
                <label className={`flex items-center gap-3 w-full border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition ${file ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}>
                  <Upload size={16} className={file ? 'text-indigo-600' : 'text-gray-400'} />
                  <span className="text-sm text-gray-500">{file ? file.name : 'Click to upload PDF'}</span>
                  <input type="file" accept="application/pdf" className="hidden" onChange={e => setFile(e.target.files[0])} />
                </label>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition">Create</button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-semibold transition">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Assignments</h2>
          <span className="text-sm text-gray-400">{assignments.length} total</span>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="font-semibold text-gray-700">No assignments yet</h3>
            <p className="text-gray-400 text-sm mt-1">Create your first assignment above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map(a => {
              const isPast = now > new Date(a.deadline);
              return (
                <div key={a._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <FileText size={20} className="text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{a.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>📅 {new Date(a.deadline).toLocaleString()}</span>
                          <span>🏆 {a.maxScore} pts</span>
                          <span className={`font-semibold ${isPast ? 'text-red-500' : 'text-green-600'}`}>
                            {isPast ? 'Closed' : 'Open'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/teacher/submissions/${a._id}`}>
                      <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl font-semibold transition">
                        Submissions <ChevronRight size={14} />
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
