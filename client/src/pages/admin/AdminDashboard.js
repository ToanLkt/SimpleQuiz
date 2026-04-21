import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppModal from '../../components/AppModal';
import AppToast from '../../components/AppToast';
import StatsCard from '../../components/StatsCard';
import { clearQuizError, fetchAdminDashboard } from '../../features/quizSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, loading, error } = useSelector((state) => state.quiz);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  const cards = dashboard?.cards || {
    totalQuizzes: 0,
    totalQuestions: 0,
    totalAttempts: 0,
  };

  return (
    <div className="container py-4">
      <AppToast message={error} variant="danger" onClose={() => dispatch(clearQuizError())} />

      <h2 className="mb-4">Admin Dashboard</h2>

      {loading && (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status" aria-label="Loading dashboard" />
        </div>
      )}

      {!loading && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <StatsCard title="Total Quizzes" value={cards.totalQuizzes} colorClass="bg-primary" />
            </div>
            <div className="col-md-4">
              <StatsCard title="Total Questions" value={cards.totalQuestions} colorClass="bg-success" />
            </div>
            <div className="col-md-4">
              <StatsCard title="Total Attempts" value={cards.totalAttempts} colorClass="bg-dark" />
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-white">
              <h5 className="mb-0">Quiz Statistics</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Quiz</th>
                    <th>Total Questions</th>
                    <th>Completed Users</th>
                    <th>Average Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(dashboard?.quizzes || []).map((quiz) => (
                    <tr key={quiz._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedQuiz(quiz)}>
                      <td>{quiz.title}</td>
                      <td>{quiz.totalQuestions}</td>
                      <td>{quiz.completedCount}</td>
                      <td>{Number(quiz.avgScore || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {(dashboard?.quizzes || []).length === 0 && (
                    <tr>
                      <td className="text-center text-muted py-4" colSpan="4">
                        No quiz statistics yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selectedQuiz && (
        <AppModal
          show={Boolean(selectedQuiz)}
          title="Chi tiet Quiz"
          onClose={() => setSelectedQuiz(null)}
          footer={
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedQuiz(null)}>
              Close
            </button>
          }
        >
          <h5 className="mb-1">{selectedQuiz.title}</h5>
          <p className="text-muted mb-3">{selectedQuiz.description || 'Khong co mo ta'}</p>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="rounded-3 bg-light p-3">
                <div className="small text-muted">Tong cau hoi</div>
                <div className="fs-4 fw-semibold">{selectedQuiz.totalQuestions}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="rounded-3 bg-light p-3">
                <div className="small text-muted">So nguoi hoan thanh</div>
                <div className="fs-4 fw-semibold">{selectedQuiz.completedCount}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="rounded-3 bg-light p-3">
                <div className="small text-muted">Diem trung binh</div>
                <div className="fs-4 fw-semibold">{Number(selectedQuiz.avgScore || 0).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </AppModal>
      )}
    </div>
  );
};

export default AdminDashboard;
