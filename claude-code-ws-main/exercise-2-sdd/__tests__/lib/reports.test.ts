import { describe, it, expect } from "vitest";
import { sortByDateDesc, filterReports } from "../../src/lib/reports";
import type { Report } from "../../src/lib/types";

const reports: Report[] = [
  { id: "1", name: "山田", category: "開発", content: "a", date: "2026-06-10" },
  { id: "2", name: "佐藤", category: "レビュー", content: "b", date: "2026-06-15" },
  { id: "3", name: "山田", category: "開発", content: "c", date: "2026-06-12" },
];

describe("sortByDateDesc", () => {
  it("日付の降順で並ぶ", () => {
    expect(sortByDateDesc(reports).map((r) => r.id)).toEqual(["2", "3", "1"]);
  });
});

describe("filterReports", () => {
  it("日付範囲で絞り込む", () => {
    const result = filterReports(reports, { dateFrom: "2026-06-11", dateTo: "2026-06-15" });
    expect(result.map((r) => r.id)).toEqual(["2", "3"]);
  });

  it("カテゴリ開発で絞り込む", () => {
    const result = filterReports(reports, { category: "開発" });
    expect(result.map((r) => r.id)).toEqual(["1", "3"]);
  });

  it("名前で部分一致絞り込み", () => {
    const result = filterReports(reports, { name: "佐藤" });
    expect(result.map((r) => r.id)).toEqual(["2"]);
  });
});
