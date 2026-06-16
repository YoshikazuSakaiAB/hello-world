import { describe, it, expect } from "vitest";
import { validateReport, isValid, isFutureDate } from "../../src/lib/validation";
import type { ReportInput } from "../../src/lib/types";

const base: ReportInput = {
  name: "山田",
  category: "開発",
  content: "実装した",
  date: "2026-06-16",
};

describe("validateReport", () => {
  it("正しい入力ではエラーが無い", () => {
    expect(isValid(validateReport(base))).toBe(true);
  });

  it("名前が空ならエラー", () => {
    expect(validateReport({ ...base, name: "" }).name).toBeDefined();
  });

  it("名前が51文字以上ならエラー", () => {
    expect(validateReport({ ...base, name: "あ".repeat(51) }).name).toBeDefined();
  });

  it("内容が空ならエラー", () => {
    expect(validateReport({ ...base, content: "" }).content).toBeDefined();
  });

  it("未来日ならエラー", () => {
    expect(validateReport({ ...base, date: "2999-01-01" }).date).toBeDefined();
  });
});

describe("isFutureDate", () => {
  it("基準日より後ならtrue", () => {
    expect(isFutureDate("2026-06-17", "2026-06-16")).toBe(true);
  });
  it("基準日と同じならfalse", () => {
    expect(isFutureDate("2026-06-16", "2026-06-16")).toBe(false);
  });
});
