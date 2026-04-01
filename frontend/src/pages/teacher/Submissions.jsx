import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function Submissions() {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [grading, setGrading] = useState({});

  useEffect(() => {
    api.get(`/submissions/assignment/${assignmentId}`).then(r => setSubmissions(r.data));
  }, [assignmentId]);

  const grade = async (subId) => {
    const { score, feedback } = grading[subId] || {};
    try {
      const { data } = await api.patch(`/submissions/${subId}/grade`, { score: Number(score), feedback });
      setSubmissions(submissions.map(s => s._id === subId ? data : s));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to grade');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <Link to="/teacher" className="text-indigo-600 text-sm hover:underline mb-4 inline-block">← Back to Dashboard</Link>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Submissions ({submissions.length})</h2>

        {submissions.length === 0
          ? <p className="text-gray-400 text-sm">No submissions yet.</p>
          : <div className="space-y-4">
              {submissions.map(s => (
                <div key={s._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">{s.student?.name}</p>
                      <p className="text-sm text-gray-500">{s.student?.email}</p>
                      <p className="text-xs text-gray-400 mt-1">Submitted: {new Date(s.submittedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      {s.isLate && <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">Late</span>}
                      {s.score !== null && <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">Score: {s.score}</span>}
                    </div>
                  </div>

                  <a href={`http://localhost:5000/${s.pdfFile}`} target="_blank" rel="noreferrer">
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-4 py-2 rounded-lg font-semibold transition mb-3">
                      📄 View Submitted PDF
                    </button>
                  </a>

                  <div className="flex gap-2 flex-wrap">
                    <input type="number" placeholder="Score"
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      value={grading[s._id]?.score ?? s.score ?? ''}
                      onChange={e => setGrading({ ...grading, [s._id]: { ...grading[s._id], score: e.target.value } })} />
                    <input placeholder="Feedback (optional)"
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      value={grading[s._id]?.feedback ?? s.feedback ?? ''}
                      onChange={e => setGrading({ ...grading, [s._id]: { ...grading[s._id], feedback: e.target.value } })} />
                    <button onClick={() => grade(s._id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg font-semibold transition">
                      Save Grade
                    </button>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}
