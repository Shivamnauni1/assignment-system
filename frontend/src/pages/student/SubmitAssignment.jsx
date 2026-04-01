import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function SubmitAssignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  useEffect(() => {
    api.get(`/assignments/${assignmentId}`).then(r => setAssignment(r.data));
  }, [assignmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMsg('Please select a PDF');
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      await api.post(`/submissions/${assignmentId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMsg('Submitted successfully!'); setMsgType('success');
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Submission failed'); setMsgType('error');
    }
  };

  if (!assignment) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  const isPast = new Date() > new Date(assignment.deadline);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Submit Assignment</h2>
        <p className="text-gray-500 text-sm mb-4">{assignment.title}</p>
        <p className="text-xs text-gray-400 mb-2">Deadline: {new Date(assignment.deadline).toLocaleString()}</p>
        {isPast && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            Deadline has passed. Submission will be marked late (score: 0).
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])}
              className="w-full text-sm text-gray-500" required />
            <p className="text-xs text-gray-400 mt-2">PDF files only</p>
          </div>
          {file && <p className="text-sm text-green-600">Selected: {file.name}</p>}
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition">
            Submit PDF
          </button>
        </form>
        {msg && <p className={`mt-3 text-sm ${msgType === 'success' ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
      </div>
    </div>
  );
}
