export default function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <div className="toolbar">
      <button className="btn" disabled={pagination.page <= 1} onClick={() => onPage(pagination.page - 1)}>Previous</button>
      <span>Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
      <button className="btn" disabled={pagination.page >= pagination.pages} onClick={() => onPage(pagination.page + 1)}>Next</button>
    </div>
  );
}
