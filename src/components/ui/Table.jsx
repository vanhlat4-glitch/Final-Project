import Loading from "../common/Loading";
import EmptyState from "./EmptyState";
import { useLanguage } from "../../hooks/useLanguage";

// columns: [{ key, label, render?(row) }]
export default function Table({ columns, rows, loading, emptyTitle, emptyHint, renderActions }) {
  const { t } = useLanguage();

  if (loading) return <Loading />;
  if (!rows || rows.length === 0) {
    return <EmptyState title={t(emptyTitle || "Chưa có dữ liệu")} hint={t(emptyHint)} />;
  }

  return (
    <div className="table-wrap">
      <table className="dtable">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{t(c.label)}</th>
            ))}
            {renderActions && <th style={{ textAlign: "right" }}>{t("Thao tác", "Actions")}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || row._id}>
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
