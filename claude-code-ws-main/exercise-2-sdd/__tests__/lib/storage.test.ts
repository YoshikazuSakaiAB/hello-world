import { describe, it, expect } from "vitest";
import { loadReports, saveReports } from "../../src/lib/storage";
import type { Report } from "../../src/lib/types";

const sample: Report[] = [
  { id: "1", name: "山田", category: "開発", content: "a", date: "2026-06-10" },
];

describe("storage", () => {
  it("保存した内容を読み込める", () => {
    saveReports(sample);
    expect(loadReports()).toEqual(sample);
  });

  it("未保存なら空配列", () => {
    expect(loadReports()).toEqual([]);
  });

  it("壊れたデータなら空配列", () => {
    localStorage.setItem("daily-reports", "not json");
    expect(loadReports()).toEqual([]);
  });
});
