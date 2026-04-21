import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import AppToast from '../components/AppToast';
import { clearQuizError, fetchLeaderboard } from '../features/quizSlice';

const Leaderboard = () => {
  const dispatch = useDispatch();
  const { quizId } = useParams();
  const { leaderboard, loading, error } = useSelector((state) => state.quiz);
  const isGlobalLeaderboard = quizId === 'ALL';

  useEffect(() => {
    if (quizId) {
      dispatch(fetchLeaderboard(quizId));
    }
  }, [dispatch, quizId]);

  return (
    <div className="container py-4">
      <AppToast message={error} variant="danger" onClose={() => dispatch(clearQuizError())} />

      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h2 className="mb-0">{isGlobalLeaderboard ? 'Bang xep hang tong' : 'Top 10 Leaderboard'}</h2>
        <Link className="btn btn-outline-secondary btn-sm" to="/quizzes">
          Back
        </Link>
      </div>

      {loading && (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status" aria-label="Loading" />
        </div>
      )}

      {!loading && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  {isGlobalLeaderboard ? (
                    <>
                      <th>Total Score</th>
                      <th>Best Score</th>
                      <th>Quizzes</th>
                    </>
                  ) : (
                    <>
                      <th>Best Score</th>
                      <th>Total Questions</th>
                    </>
                  )}
                  <th>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item, index) => (
                  <tr key={item.userId}>
                    <td>{index + 1}</td>
                    <td>{item.username}</td>
                    {isGlobalLeaderboard ? (
                      <>
                        <td>
                          {item.totalScore}/{item.totalPossibleScore}
                        </td>
                        <td>{item.bestScore}</td>
                        <td>{item.quizzesPlayed}</td>
                      </>
                    ) : (
                      <>
                        <td>{item.bestScore}</td>
                        <td>{item.totalQuestions}</td>
                      </>
                    )}
                    <td>{item.attempts}</td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={isGlobalLeaderboard ? '6' : '5'} className="text-center py-3 text-muted">
                      No result yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
