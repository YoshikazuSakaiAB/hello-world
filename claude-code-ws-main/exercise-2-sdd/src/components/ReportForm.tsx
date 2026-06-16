import { useEffect, useState } from "react";
import { CATEGORIES, type Category, type Report, type ReportInput } from "../lib/types";
import { validateReport, isValid, todayString } from "../lib/validation";

interface ReportFormProps {
  initial?: Report;
  onSubmit: (input: ReportInput) => void;
  onCancel?: () => void;
}

const emptyInput: ReportInput = {
  name: "",
  category: "開発",
  content: "",
  date: todayString(),
};

export function ReportForm({ initial, onSubmit, onCancel }: ReportFormProps) {
  const [input, setInput] = useState<ReportInput>(emptyInput);

  useEffect(() => {
    if (initial) {
      const { id: _id, ...rest } = initial;
      void _id;
      setInput(rest);
    } else {
      setInput(emptyInput);
    }
  }, [initial]);

  const errors = validateReport(input);
  const valid = isValid(errors);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({ ...input, name: input.name.trim(), content: input.content.trim() });
    if (!initial) setInput(emptyInput);
  };

  return (
    <form onSubmit={handleSubmit} aria-label="日報フォーム">
      <div>
        <label htmlFor="name">名前</label>
        <input
          id="name"
          type="text"
          value={input.name}
          onChange={(e) => setInput({ ...input, name: e.target.value })}
        />
        {errors.name && <span role="alert">{errors.name}</span>}
      </div>

      <div>
        <label htmlFor="category">カテゴリ</label>
        <select
          id="category"
          value={input.category}
          onChange={(e) => setInput({ ...input, category: e.target.value as Category })}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="content">内容</label>
        <textarea
          id="content"
          value={input.content}
          onChange={(e) => setInput({ ...input, content: e.target.value })}
        />
        {errors.content && <span role="alert">{errors.content}</span>}
      </div>

      <div>
        <label htmlFor="date">日付</label>
        <input
          id="date"
          type="date"
          value={input.date}
          onChange={(e) => setInput({ ...input, date: e.target.value })}
        />
        {errors.date && <span role="alert">{errors.date}</span>}
      </div>

      <button type="submit" disabled={!valid}>
        {initial ? "更新" : "投稿"}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel}>
          キャンセル
        </button>
      )}
    </form>
  );
}
