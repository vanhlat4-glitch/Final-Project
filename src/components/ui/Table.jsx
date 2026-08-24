import Loading from "../common/Loading";
import EmptyState from "./EmptyState";

// columns: [{ key, label, render?(row) }]
export default function Table({ columns, rows, loading, emptyTitle, emptyHint, renderActions }) {
  if (loading) return <Loading />;
  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle || "Chưa có dữ liệu"} hint={emptyHint} />;
  }

  return (
    <div className="table-wrap">
      <table className="dtable">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
            {renderActions && <th style={{ textAlign: "right" }}>Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
              {renderActions && (
                <td>
                  <div className="cell-actions">{renderActions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
