import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppToast from '../components/AppToast';
import QuizCard from '../components/QuizCard';
import { clearQuizError, fetchQuizzes } from '../features/quizSlice';

const Home = () => {
  const dispatch = useDispatch();
  const { quizzes, loading, error } = useSelector((state) => state.quiz);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  return (
    <div className="container py-4">
      <AppToast message={error} variant="danger" onClose={() => dispatch(clearQuizError())} />

      <h2 className="mb-4">Quiz List</h2>

      {loading && (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status" aria-label="Loading" />
        </div>
      )}

      <div className="row g-3">
        {quizzes.map((quiz) => (
          <div className="col-md-6 col-lg-4" key={quiz._id}>
            <QuizCard quiz={quiz} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
