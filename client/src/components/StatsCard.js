const StatsCard = ({ title, value, colorClass = 'bg-primary' }) => {
  return (
    <div className={`card border-0 shadow-sm text-white h-100 ${colorClass}`}>
      <div className={`card-body ${colorClass}`}>
        <h6 className="text-uppercase">{title}</h6>
        <h3 className="mb-0">{value}</h3>
      </div>
    </div>
  );
};

export default StatsCard;
