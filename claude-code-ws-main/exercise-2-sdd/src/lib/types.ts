export const CATEGORIES = ["開発", "レビュー", "ミーティング", "その他"] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Report {
  id: string;
  name: string;
  category: Category;
  content: string;
  date: string; // YYYY-MM-DD
}

export type ReportInput = Omit<Report, "id">;

export interface ReportFilter {
  dateFrom?: string;
  dateTo?: string;
  category?: Category | "";
  name?: string;
}
