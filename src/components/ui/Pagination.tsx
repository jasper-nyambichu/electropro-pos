interface PaginationProps {
  showingFrom: number;
  showingTo: number;
  total: number;
  currentPage: number;
  totalPages: number;
}

export default function Pagination({
  showingFrom,
  showingTo,
  total,
  currentPage,
  totalPages,
}: PaginationProps) {
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);

  return (
    <div className="px-[15px] py-[10px] bg-[#F4F4F4] border-t border-[#EEEEEE] flex flex-col md:flex-row justify-between items-center gap-4 text-label-sm">
      <div className="text-secondary">
        Showing {showingFrom} to {showingTo} of {total} entries
      </div>
      <div className="flex items-center gap-1">
        <button className="px-2 py-1 bg-white border border-[#DDD] rounded text-secondary hover:bg-gray-50 disabled:opacity-50">
          Previous
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={
              p === currentPage
                ? "px-3 py-1 bg-primary text-on-primary rounded border border-primary"
                : "px-3 py-1 bg-white border border-[#DDD] rounded text-secondary hover:bg-gray-50"
            }
          >
            {p}
          </button>
        ))}
        <button className="px-2 py-1 bg-white border border-[#DDD] rounded text-secondary hover:bg-gray-50">
          Next
        </button>
      </div>
    </div>
  );
}