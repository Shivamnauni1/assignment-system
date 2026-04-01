import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import { FileText, CheckCircle, Award } from '../../components/Icons';

export default function Submissions() {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [grading, setGrading] = useState({});
  const [saved, setSaved] = useState({});

  useEffect(() => {
    api.get(`/submissions/assignment/${assignmentId}`).then(r => setSubmissions(r.data));
  }, [assignmentId]);

  const grade = async (subId) => {
    const { score, feedback } = grading[subId] || {};
    try {
      const { data } = await api.patch(`/submissions/${subId}/grade`, { score: Number(score), feedback });
      setSubmissions(submissions.map(s => s._id === subId ? data : s));
      setSaved({ ...saved, [subId]: true });
      setTimeout(() => setSaved(p => ({ ...p, [subId]: false })), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to grade');
    }
  };

  const graded = submissions.filter(s => s.score !== null).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link to="/teacher" className="inline-flex items-center gap-1 text-indigo-600 text-sm hover:underline mb-6">← Back to Dashboard</Link>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Submissions', value: submissions.length, icon: <FileText size={18} className="text-indigo-600" />, bg: 'bg-indigo-50' },
            { label: 'Graded', value: graded, icon: <CheckCircle size={18} className="text-green-600" />, bg: 'bg-green-50' },
            { label: 'Pending Grade', value: submissions.length - graded, icon: <Award size={18} className="text-amber-600" />, bg: 'bg-amber-50' },
          ].map(({ label, value, icon, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>{icon}</div>
              <div>
                <p className="text-xl font-bold text-gray-800">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-4">Student Submissions</h2>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="font-semibold text-gray-700">No submissions yet</h3>
            <p className="text-gray-400 text-sm mt-1">Students haven't submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map(s => (
              <div key={s._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-indigo-600">{s.student?.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{s.student?.name}</p>
                      <p className="text-xs text-gray-400">{s.student?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.isLate && <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">Late</span>}
                    {s.score !== null
                      ? <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">Score: {s.score}</span>
                      : <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">Not graded</span>
                    }
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                  <span>📅 Submitted: {new Date(s.submittedAt).toLocaleString()}</span>
                </div>

                <a href={`http://localhost:5000/${s.pdfFile}`} target="_blank" rel="noreferrer">
                  <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-xl font-semibold transition mb-4">
                    <FileText size={14} /> View Submitted PDF
                  </button>
                </a>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Grade this submission</p>
                  <div className="flex gap-3 flex-wrap">
                    <input type="number" placeholder="Score"
                      className="border border-gray-200 bg-white rounded-xl px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      value={grading[s._id]?.score ?? (s.score ?? '')}
                      onChange={e => setGrading({ ...grading, [s._id]: { ...grading[s._id], score: e.target.value } })} />
                    <input placeholder="Feedback (optional)"
                      className="border border-gray-200 bg-white rounded-xl px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      value={grading[s._id]?.feedback ?? (s.feedback ?? '')}
                      onChange={e => setGrading({ ...grading, [s._id]: { ...grading[s._id], feedback: e.target.value } })} />
                    <button onClick={() => grade(s._id)}
                      className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-semibold transition ${saved[s._id] ? 'bg-green-100 text-green-700' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                      {saved[s._id] ? <><CheckCircle size={14} /> Saved!</> : 'Save Grade'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
