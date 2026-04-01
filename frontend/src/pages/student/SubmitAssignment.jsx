import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Upload, FileText, CheckCircle } from '../../components/Icons';

export default function SubmitAssignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get(`/assignments/${assignmentId}`).then(r => setAssignment(r.data));
  }, [assignmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMsg('Please select a PDF');
    setLoading(true);
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      await api.post(`/submissions/${assignmentId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDone(true);
      setTimeout(() => navigate(-1), 2500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Submission failed'); setMsgType('error');
    } finally { setLoading(false); }
  };

  if (!assignment) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-3 animate-pulse">📄</div><p className="text-gray-400">Loading...</p></div>
    </div>
  );

  const isPast = new Date() > new Date(assignment.deadline);
  const hoursLeft = Math.max(0, Math.ceil((new Date(assignment.deadline) - new Date()) / (1000*60*60)));

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Submitted!</h2>
        <p className="text-gray-500">Your assignment has been submitted successfully.</p>
        <p className="text-sm text-gray-400 mt-2">Redirecting back...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Link to={-1} className="inline-flex items-center gap-1 text-indigo-600 text-sm hover:underline mb-6">← Back</Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <p className="text-indigo-200 text-xs">Submitting</p>
                <h2 className="font-bold text-lg">{assignment.title}</h2>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="bg-white/15 px-3 py-1 rounded-full">🏆 {assignment.maxScore} pts</span>
              <span className={`px-3 py-1 rounded-full ${isPast ? 'bg-red-400/30' : 'bg-white/15'}`}>
                {isPast ? '⚠️ Deadline passed' : `⏰ ${hoursLeft}h remaining`}
              </span>
            </div>
          </div>

          <div className="p-6">
            {isPast && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-700">
                <strong>Late submission:</strong> This will be marked as late and may receive a score of 0.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload your PDF</label>
                <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition ${file ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50'}`}>
                  <div className="text-center">
                    {file ? (
                      <>
                        <div className="text-3xl mb-2">📄</div>
                        <p className="text-sm font-semibold text-indigo-700">{file.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                      </>
                    ) : (
                      <>
                        <Upload size={28} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-500">Click to upload PDF</p>
                        <p className="text-xs text-gray-400 mt-1">PDF files only</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept="application/pdf" className="hidden"
                    onChange={e => setFile(e.target.files[0])} required />
                </label>
              </div>

              {msg && (
                <div className={`text-sm px-4 py-3 rounded-xl ${msgType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>
              )}

              <button type="submit" disabled={loading || !file}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition shadow-md shadow-indigo-200">
                {loading ? 'Submitting...' : <><Upload size={16} /> Submit Assignment</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
