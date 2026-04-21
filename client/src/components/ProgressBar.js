const ProgressBar = ({ answeredCount, totalQuestions }) => {
  const percent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div>
      <div className="d-flex justify-content-between mb-1">
        <span>Progress</span>
        <strong>
          {answeredCount}/{totalQuestions}
        </strong>
      </div>
      <div className="progress" role="progressbar" aria-label="Quiz progress">
        <div className="progress-bar" style={{ width: `${percent}%` }}>
          {percent}%
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
