import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TakeQuiz from './pages/TakeQuiz';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageQuizzes from './pages/admin/ManageQuizzes';
import ManageQuestions from './pages/admin/ManageQuestions';
import { fetchMe, logout } from './features/authSlice';
import { AUTH_EXPIRED_EVENT } from './services/api';

const App = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
    }
  }, [dispatch, token]);

  useEffect(() => {
    const handleAuthExpired = () => {
      dispatch(logout());
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/quizzes" element={<Home />} />
        <Route
          path="/take-quiz/:quizId"
          element={
            <ProtectedRoute>
              <TakeQuiz />
            </ProtectedRoute>
          }
        />
        <Route path="/leaderboard/:quizId" element={<Leaderboard />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-quizzes"
          element={
            <ProtectedRoute allowRoles={['admin']}>
              <ManageQuizzes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-questions"
          element={
            <ProtectedRoute allowRoles={['admin']}>
              <ManageQuestions />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
