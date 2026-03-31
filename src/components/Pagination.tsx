import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) pages.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('ellipsis');

  pages.push(total);

  return pages;
}

export function Pagination({ currentPage, totalPages, onPageChange, isLoading }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="pagination" aria-label="Product pagination" role="navigation">
      <button
        className="pagination__btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isLoading}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
        <span className="pagination__btn-text">Prev</span>
      </button>

      <div className="pagination__pages" role="list">
        {pages.map((page, idx) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="pagination__ellipsis" aria-hidden="true">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`pagination__page ${page === currentPage ? 'pagination__page--active' : ''}`}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        className="pagination__btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || isLoading}
        aria-label="Next page"
      >
        <span className="pagination__btn-text">Next</span>
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
