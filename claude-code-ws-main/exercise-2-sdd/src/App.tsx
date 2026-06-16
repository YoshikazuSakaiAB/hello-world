import { useEffect, useMemo, useState } from "react";
import type { Report, ReportFilter as Filter, ReportInput } from "./lib/types";
import { loadReports, saveReports } from "./lib/storage";
import { createId, filterReports, sortByDateDesc } from "./lib/reports";
import { ReportForm } from "./components/ReportForm";
import { ReportList } from "./components/ReportList";
import { ReportFilter } from "./components/ReportFilter";

export function App() {
  const [reports, setReports] = useState<Report[]>(() => loadReports());
  const [filter, setFilter] = useState<Filter>({});
  const [editing, setEditing] = useState<Report | undefined>(undefined);

  useEffect(() => {
    saveReports(reports);
  }, [reports]);

  const visible = useMemo(
    () => sortByDateDesc(filterReports(reports, filter)),
    [reports, filter],
  );

  const handleSubmit = (input: ReportInput) => {
    if (editing) {
      setReports((prev) =>
        prev.map((r) => (r.id === editing.id ? { ...input, id: editing.id } : r)),
      );
      setEditing(undefined);
    } else {
      setReports((prev) => [...prev, { ...input, id: createId() }]);
    }
  };

  const handleDelete = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    if (editing?.id === id) setEditing(undefined);
  };

  return (
    <main>
      <h1>日報アプリ</h1>
      <section>
        <h2>{editing ? "日報を編集" : "日報を投稿"}</h2>
        <ReportForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={editing ? () => setEditing(undefined) : undefined}
        />
      </section>
      <section>
        <h2>日報一覧</h2>
        <ReportFilter filter={filter} onChange={setFilter} />
        <ReportList reports={visible} onEdit={setEditing} onDelete={handleDelete} />
      </section>
    </main>
  );
}
