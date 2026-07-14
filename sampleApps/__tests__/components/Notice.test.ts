import { describe, it, expect } from "vitest";
import { createNotice } from "../../src/components/Notice";

describe("createNotice (SPEC-001-R7)", () => {
  it("is hidden with no message initially", () => {
    const notice = createNotice();
    expect(notice.element.hidden).toBe(true);
    expect(notice.element.textContent).toBe("");
  });

  it("shows a message and becomes visible", () => {
    const notice = createNotice();
    notice.show("UTF-8 で保存しました");
    expect(notice.element.hidden).toBe(false);
    expect(notice.element.textContent).toBe("UTF-8 で保存しました");
  });

  it("clears the message and hides again", () => {
    const notice = createNotice();
    notice.show("通知");
    notice.clear();
    expect(notice.element.hidden).toBe(true);
    expect(notice.element.textContent).toBe("");
  });

  // 情報通知なので role=status（エラーではない）
  it("uses role=status (not alert)", () => {
    const notice = createNotice();
    expect(notice.element.getAttribute("role")).toBe("status");
  });
});
