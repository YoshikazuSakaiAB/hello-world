import { describe, it, expect } from "vitest";
import { createErrorBanner } from "../../src/components/ErrorBanner";

describe("createErrorBanner (SPEC-001-R5/R8)", () => {
  it("is hidden with no message initially", () => {
    const banner = createErrorBanner();
    expect(banner.element.hidden).toBe(true);
    expect(banner.element.textContent).toBe("");
  });

  it("shows a message and becomes visible", () => {
    const banner = createErrorBanner();
    banner.show(".md ファイルを選択してください");
    expect(banner.element.hidden).toBe(false);
    expect(banner.element.textContent).toBe(".md ファイルを選択してください");
  });

  it("clears the message and hides again", () => {
    const banner = createErrorBanner();
    banner.show("エラー");
    banner.clear();
    expect(banner.element.hidden).toBe(true);
    expect(banner.element.textContent).toBe("");
  });
});
