const Skeleton = ({ className = '', width = 'w-full', height = 'h-4' }) => {
  return (
    <div className={`${width} ${height} bg-gray-200 rounded animate-pulse ${className}`} />
  );
};

export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex space-x-4">
        {Array(columns).fill(0).map((_, i) => (
          <Skeleton key={i} width="flex-1" height="h-8" />
        ))}
      </div>
      
      {/* Rows */}
      {Array(rows).fill(0).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array(columns).fill(0).map((_, colIndex) => (
            <Skeleton key={colIndex} width="flex-1" height="h-12" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;