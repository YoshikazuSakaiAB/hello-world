import { CATEGORIES, type Category, type ReportFilter as Filter } from "../lib/types";

interface ReportFilterProps {
  filter: Filter;
  onChange: (filter: Filter) => void;
}

export function ReportFilter({ filter, onChange }: ReportFilterProps) {
  return (
    <div aria-label="フィルタ">
      <label htmlFor="filter-from">開始日</label>
      <input
        id="filter-from"
        type="date"
        value={filter.dateFrom ?? ""}
        onChange={(e) => onChange({ ...filter, dateFrom: e.target.value })}
      />

      <label htmlFor="filter-to">終了日</label>
      <input
        id="filter-to"
        type="date"
        value={filter.dateTo ?? ""}
        onChange={(e) => onChange({ ...filter, dateTo: e.target.value })}
      />

      <label htmlFor="filter-category">カテゴリ</label>
      <select
        id="filter-category"
        value={filter.category ?? ""}
        onChange={(e) => onChange({ ...filter, category: e.target.value as Category | "" })}
      >
        <option value="">すべて</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label htmlFor="filter-name">名前</label>
      <input
        id="filter-name"
        type="text"
        value={filter.name ?? ""}
        onChange={(e) => onChange({ ...filter, name: e.target.value })}
      />
    </div>
  );
}
