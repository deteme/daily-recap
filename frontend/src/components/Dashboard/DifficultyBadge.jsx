const DifficultyBadge = ({ count }) => {
  if (!count || count === 0) return null;
  
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      ⚠️ {count} difficulté{count > 1 ? 's' : ''}
    </span>
  );
};

export default DifficultyBadge;