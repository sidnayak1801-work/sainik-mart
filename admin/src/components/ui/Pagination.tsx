import styles from "./DataTable.module.css";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const visiblePages = (page: number, totalPages: number): number[] => {
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  const pages: number[] = [];
  for (let current = adjustedStart; current <= end; current += 1) {
    pages.push(current);
  }
  return pages;
};

export const Pagination = ({ page, totalPages, onPageChange }: Props) => {
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      {visiblePages(page, totalPages).map((item) => (
        <button
          key={item}
          type="button"
          aria-current={item === page ? "page" : undefined}
          onClick={() => onPageChange(item)}
        >
          {item}
        </button>
      ))}
      <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  );
};
