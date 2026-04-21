import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import AppToast from '../components/AppToast';
import ProgressBar from '../components/ProgressBar';
import {
  clearQuizError,
  clearQuizResult,
  fetchQuizById,
  setAnswer,
  submitQuizResult,
} from '../features/quizSlice';

const TakeQuiz = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quizId } = useParams();

  const { currentQuiz, answers, loading, submitting, error, result } = useSelector((state) => state.quiz);
  const [toast, setToast] = useState({ message: '', variant: 'danger' });

  const showToast = (message, variant = 'danger') => {
    setToast({ message, variant });
  };

  const clearToast = () => {
    setToast({ message: '', variant: 'danger' });
  };

  useEffect(() => {
    dispatch(fetchQuizById(quizId));
    dispatch(clearQuizResult());
    dispatch(clearQuizError());
  }, [dispatch, quizId]);

  useEffect(() => {
    if (error) {
      showToast(error);
    }
  }, [error]);

  const totalQuestions = currentQuiz?.questions?.length || 0;
  const answeredCount = useMemo(() => answers.filter((a) => a !== null).length, [answers]);
  const canSubmit = totalQuestions > 0 && answeredCount === totalQuestions;

  const onChoose = (questionIndex, selectedIndex) => {
    dispatch(setAnswer({ questionIndex, selectedIndex }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit || !currentQuiz) {
      showToast('Please answer all questions before submit.', 'warning');
      return;
    }

    const payload = {
      quizId: currentQuiz._id,
      answers: currentQuiz.questions.map((question, index) => ({
        questionId: question._id,
        selectedIndex: answers[index],
      })),
    };

    try {
      await dispatch(submitQuizResult(payload)).unwrap();
      clearToast();
      dispatch(clearQuizError());
      showToast('Submit successful.', 'success');
    } catch (submitError) {
      console.error(submitError);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status" aria-label="Loading quiz" />
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div className="container py-4">
        <div className="card border-warning shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-2">Quiz not found</h5>
            <p className="text-muted mb-0">Quiz nay khong ton tai hoac da bi xoa.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <AppToast
        message={toast.message}
        variant={toast.variant}
        position="bottom-end"
        onClose={() => {
          clearToast();
          if (error) {
            dispatch(clearQuizError());
          }
        }}
      />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">{currentQuiz.title}</h2>
          <p className="text-muted mb-0">{currentQuiz.description}</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <ProgressBar answeredCount={answeredCount} totalQuestions={totalQuestions} />
        </div>
      </div>

      <form onSubmit={onSubmit}>
        {currentQuiz.questions.map((question, qIndex) => (
          <div className="card shadow-sm mb-3" key={question._id}>
            <div className="card-body">
              <h5 className="mb-3">
                Q{qIndex + 1}. {question.text}
              </h5>

              {question.options.map((option, optionIndex) => (
                <div className="form-check mb-2" key={`${question._id}-${optionIndex}`}>
                  <input
                    className="form-check-input"
                    type="radio"
                    id={`${question._id}-${optionIndex}`}
                    name={`question-${question._id}`}
                    checked={answers[qIndex] === optionIndex}
                    onChange={() => {
                      onChoose(qIndex, optionIndex);
                      clearToast();
                    }}
                  />
                  <label className="form-check-label" htmlFor={`${question._id}-${optionIndex}`}>
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button className="btn btn-primary" type="submit" disabled={!canSubmit || submitting}>
          {submitting ? (
            <span className="d-inline-flex align-items-center">
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
              Submitting...
            </span>
          ) : (
            'Submit'
          )}
        </button>
      </form>

      {result && (
        <div className="card border-success bg-light mt-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title text-success mb-2">Ket qua</h5>
            <div className="fs-4 fw-semibold">
              Score: {result.score}/{result.totalQuestions}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;
