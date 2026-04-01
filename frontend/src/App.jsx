import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import JoinSession from './pages/JoinSession';

import StudentDashboard from './pages/student/StudentDashboard';
import SessionView from './pages/student/SessionView';
import SubmitAssignment from './pages/student/SubmitAssignment';
import Profile from './pages/student/Profile';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import SessionManage from './pages/teacher/SessionManage';
import Submissions from './pages/teacher/Submissions';

import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join/:code" element={<JoinSession />} />

          {/* Student routes */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><Profile /></ProtectedRoute>} />
          <Route path="/student/session/:sessionId" element={<ProtectedRoute allowedRoles={['student']}><SessionView /></ProtectedRoute>} />
          <Route path="/student/submit/:assignmentId" element={<ProtectedRoute allowedRoles={['student']}><SubmitAssignment /></ProtectedRoute>} />

          {/* Teacher routes */}
          <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/session/:sessionId" element={<ProtectedRoute allowedRoles={['teacher']}><SessionManage /></ProtectedRoute>} />
          <Route path="/teacher/submissions/:assignmentId" element={<ProtectedRoute allowedRoles={['teacher']}><Submissions /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
