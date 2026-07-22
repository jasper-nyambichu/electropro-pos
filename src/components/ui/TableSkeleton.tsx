interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({ rows = 6, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full animate-pulse">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b border-outline-variant/20 bg-surface-container">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-3 bg-outline-variant/30 rounded flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className={`flex items-center gap-4 px-4 py-3 border-b border-outline-variant/10 ${
            rowIdx % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-white'
          }`}
        >
          {/* Avatar/image placeholder */}
          <div className="w-9 h-9 bg-outline-variant/20 rounded shrink-0" />

          {/* Text lines */}
          {Array.from({ length: columns - 1 }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="flex-1 space-y-1.5"
            >
              <div
                className="h-3 bg-outline-variant/20 rounded"
                style={{ width: `${60 + Math.random() * 30}%` }}
              />
              {colIdx === 0 && (
                <div className="h-2.5 bg-outline-variant/10 rounded w-2/3" />
              )}
            </div>
          ))}

          {/* Badge placeholder */}
          <div className="w-16 h-5 bg-outline-variant/15 rounded-full shrink-0" />

          {/* Action buttons placeholder */}
          <div className="flex gap-2 shrink-0">
            <div className="w-7 h-7 bg-outline-variant/15 rounded" />
            <div className="w-7 h-7 bg-outline-variant/15 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}