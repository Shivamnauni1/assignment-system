import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function SessionManage() {
  const { sessionId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', deadline: '', maxScore: 100 });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  useEffect(() => {
    api.get(`/assignments/session/${sessionId}`).then(r => setAssignments(r.data));
  }, [sessionId]);

  const createAssignment = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('sessionId', sessionId);
    fd.append('deadline', form.deadline);
    fd.append('maxScore', form.maxScore);
    if (file) fd.append('pdf', file);
    try {
      const { data } = await api.post('/assignments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAssignments([...assignments, data]);
      setForm({ title: '', description: '', deadline: '', maxScore: 100 });
      setFile(null);
      setMsg('Assignment created!'); setMsgType('success');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed'); setMsgType('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <Link to="/teacher" className="text-indigo-600 text-sm hover:underline mb-4 inline-block">← Back to Dashboard</Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create Assignment</h2>
          <form onSubmit={createAssignment} className="space-y-3">
            <input className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <textarea className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              placeholder="Description (optional)" rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Deadline</label>
                <input type="datetime-local" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Max Score</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.maxScore} onChange={e => setForm({ ...form, maxScore: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Assignment PDF (optional)</label>
              <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])}
                className="w-full text-sm text-gray-500" />
            </div>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition">
              Create Assignment
            </button>
          </form>
          {msg && <p className={`mt-2 text-sm ${msgType === 'success' ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-3">Assignments ({assignments.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {assignments.map(a => (
            <div key={a._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-1">{a.title}</h3>
              <p className="text-xs text-gray-400 mb-1">Deadline: {new Date(a.deadline).toLocaleString()}</p>
              <p className="text-xs text-gray-400 mb-3">Max Score: {a.maxScore}</p>
              <Link to={`/teacher/submissions/${a._id}`}>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg font-semibold transition">View Submissions</button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
