import { CATEGORIES, type Category, type ReportInput } from "./types";

export interface ValidationErrors {
  name?: string;
  category?: string;
  content?: string;
  date?: string;
}

export function todayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isFutureDate(date: string, today: string = todayString()): boolean {
  return date > today;
}

export function validateReport(input: ReportInput): ValidationErrors {
  const errors: ValidationErrors = {};

  const name = input.name.trim();
  if (name.length < 1 || name.length > 50) {
    errors.name = "名前は1〜50文字で入力してください";
  }

  if (!CATEGORIES.includes(input.category as Category)) {
    errors.category = "カテゴリを選択してください";
  }

  const content = input.content.trim();
  if (content.length < 1 || content.length > 1000) {
    errors.content = "内容は1〜1000文字で入力してください";
  }

  if (!input.date) {
    errors.date = "日付を入力してください";
  } else if (isFutureDate(input.date)) {
    errors.date = "未来の日付は選択できません";
  }

  return errors;
}

export function isValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
