import { Link } from 'react-router-dom';

const QuizCard = ({ quiz }) => {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{quiz.title}</h5>
        <p className="card-text text-muted flex-grow-1">{quiz.description}</p>
        <div className="d-flex gap-2">
          <Link className="btn btn-primary btn-sm" to={`/take-quiz/${quiz._id}`}>
          Take Quiz
          </Link>
          <Link className="btn btn-outline-secondary btn-sm" to={`/leaderboard/${quiz._id}`}>
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
