import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function SessionView() {
  const { sessionId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    api.get(`/assignments/session/${sessionId}`).then(r => setAssignments(r.data));
    api.get(`/submissions/my/scores/${sessionId}`).then(r => setScores(r.data));
  }, [sessionId]);

  const getScore = (assignmentId) => scores.find(s => s.assignment.id === assignmentId);
  const now = new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <Link to="/student" className="text-indigo-600 text-sm hover:underline mb-4 inline-block">← Back to Dashboard</Link>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Assignments</h2>
        {assignments.length === 0
          ? <p className="text-gray-400 text-sm">No assignments yet.</p>
          : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assignments.map(a => {
                const scoreData = getScore(a._id);
                const isPast = now > new Date(a.deadline);
                return (
                  <div key={a._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-semibold text-gray-800 mb-1">{a.title}</h3>
                    {a.description && <p className="text-sm text-gray-500 mb-2">{a.description}</p>}
                    <p className="text-xs text-gray-400">Deadline: {new Date(a.deadline).toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mb-3">Max Score: {a.maxScore}</p>

                    {scoreData?.submitted
                      ? <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${scoreData.isLate ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {scoreData.isLate ? 'Late' : 'Submitted'} · Score: {scoreData.score ?? 'Pending'}
                        </span>
                      : isPast
                        ? <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700">Missed · Score: 0</span>
                        : <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">Pending Submission</span>
                    }

                    <div className="flex gap-2 mt-3">
                      {!scoreData?.submitted && !isPast && (
                        <Link to={`/student/submit/${a._id}`}>
                          <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-lg font-semibold transition">Submit</button>
                        </Link>
                      )}
                      {a.pdfFile && (
                        <a href={`http://localhost:5000/${a.pdfFile}`} target="_blank" rel="noreferrer">
                          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-4 py-2 rounded-lg font-semibold transition">View PDF</button>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
        }
      </div>
    </div>
  );
}
