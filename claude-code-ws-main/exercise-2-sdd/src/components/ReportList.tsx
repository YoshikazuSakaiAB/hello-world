import type { Report } from "../lib/types";
import { truncateContent } from "../lib/reports";

interface ReportListProps {
  reports: Report[];
  onEdit: (report: Report) => void;
  onDelete: (id: string) => void;
}

export function ReportList({ reports, onEdit, onDelete }: ReportListProps) {
  if (reports.length === 0) {
    return <p>日報がありません</p>;
  }

  return (
    <ul aria-label="日報一覧">
      {reports.map((r) => (
        <li key={r.id} aria-label={`日報-${r.id}`}>
          <span>{r.name}</span>
          <span>{r.category}</span>
          <span>{r.date}</span>
          <p>{truncateContent(r.content)}</p>
          <button type="button" onClick={() => onEdit(r)}>
            編集
          </button>
          <button type="button" onClick={() => onDelete(r.id)}>
            削除
          </button>
        </li>
      ))}
    </ul>
  );
}
