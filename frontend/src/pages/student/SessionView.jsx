import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import { FileText, Clock, CheckCircle, XCircle, Award, ChevronRight } from '../../components/Icons';

export default function SessionView() {
  const { sessionId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    api.get(`/assignments/session/${sessionId}`).then(r => setAssignments(r.data));
    api.get(`/submissions/my/scores/${sessionId}`).then(r => setScores(r.data));
  }, [sessionId]);

  const getScore = (id) => scores.find(s => s.assignment.id === id);
  const now = new Date();

  const submitted = scores.filter(s => s.submitted).length;
  const total = assignments.length;
  const totalScore = scores.reduce((acc, s) => acc + (s.score || 0), 0);
  const maxTotal = scores.reduce((acc, s) => acc + (s.assignment?.maxScore || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profileLink="/student/profile" />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link to="/student" className="inline-flex items-center gap-1 text-indigo-600 text-sm hover:underline mb-6">
          ← Back to Dashboard
        </Link>

        {/* Stats row */}
        {total > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total', value: total, icon: <FileText size={18} className="text-indigo-600" />, bg: 'bg-indigo-50' },
              { label: 'Submitted', value: submitted, icon: <CheckCircle size={18} className="text-green-600" />, bg: 'bg-green-50' },
              { label: 'Pending', value: total - submitted, icon: <Clock size={18} className="text-amber-600" />, bg: 'bg-amber-50' },
              { label: 'Score', value: maxTotal ? `${totalScore}/${maxTotal}` : '—', icon: <Award size={18} className="text-purple-600" />, bg: 'bg-purple-50' },
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
        )}

        <h2 className="text-xl font-bold text-gray-800 mb-4">Assignments</h2>

        {assignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="font-semibold text-gray-700">No assignments yet</h3>
            <p className="text-gray-400 text-sm mt-1">Your teacher hasn't posted any assignments yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map(a => {
              const scoreData = getScore(a._id);
              const isPast = now > new Date(a.deadline);
              const hoursLeft = Math.max(0, Math.ceil((new Date(a.deadline) - now) / (1000*60*60)));

              let statusBadge, statusIcon;
              if (scoreData?.submitted && !scoreData.isLate) {
                statusBadge = <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle size={12} /> Submitted</span>;
              } else if (scoreData?.submitted && scoreData.isLate) {
                statusBadge = <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">Late Submission</span>;
              } else if (isPast) {
                statusBadge = <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"><XCircle size={12} /> Missed</span>;
              } else {
                statusBadge = <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"><Clock size={12} /> Due in {hoursLeft}h</span>;
              }

              return (
                <div key={a._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText size={20} className="text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{a.title}</h3>
                        {a.description && <p className="text-sm text-gray-500 mb-2">{a.description}</p>}
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>📅 {new Date(a.deadline).toLocaleString()}</span>
                          <span>🏆 Max: {a.maxScore} pts</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {statusBadge}
                      {scoreData?.score !== null && scoreData?.score !== undefined && (
                        <span className="text-sm font-bold text-indigo-600">{scoreData.score}/{a.maxScore}</span>
                      )}
                    </div>
                  </div>

                  {scoreData?.feedback && (
                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-sm text-blue-700">
                      💬 <span className="font-medium">Feedback:</span> {scoreData.feedback}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    {!scoreData?.submitted && !isPast && (
                      <Link to={`/student/submit/${a._id}`}>
                        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl font-semibold transition shadow-sm shadow-indigo-200">
                          Submit Assignment <ChevronRight size={14} />
                        </button>
                      </Link>
                    )}
                    {a.pdfFile && (
                      <a href={`http://localhost:5000/${a.pdfFile}`} target="_blank" rel="noreferrer">
                        <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-xl font-semibold transition">
                          <FileText size={14} /> View PDF
                        </button>
                      </a>
                    )}
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
