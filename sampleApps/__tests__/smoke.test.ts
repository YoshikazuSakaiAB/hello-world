import { describe, it, expect } from "vitest";

// 足場（ビルド・テスト基盤）が動作することを確認するスモークテスト。
// 各要件のテストは lib/ components/ 配下に実装フェーズで追加する。
describe("scaffold", () => {
  it("test runner works", () => {
    expect(1 + 1).toBe(2);
  });
});
