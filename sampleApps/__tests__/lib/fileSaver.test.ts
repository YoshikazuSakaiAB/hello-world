import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isEncodingChanged, saveText } from "../../src/lib/fileSaver";

describe("isEncodingChanged (SPEC-001-R7)", () => {
  // 保存は UTF-8 固定。元が UTF-8 なら変わらない
  it("returns false when source is utf-8", () => {
    expect(isEncodingChanged("utf-8")).toBe(false);
  });

  // 元が Shift-JIS なら UTF-8 保存で変わる
  it("returns true when source is shift_jis", () => {
    expect(isEncodingChanged("shift_jis")).toBe(true);
  });
});

describe("saveText (SPEC-001-R3/R7)", () => {
  beforeEach(() => {
    // jsdom には URL.createObjectURL / revokeObjectURL が無いためスタブする
    URL.createObjectURL = vi.fn(() => "blob:mock");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // SPEC-001-R3 正常系: ダウンロードが起動される（<a download> がクリックされる）
  it("triggers a download with the given filename", () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    const result = saveText("edited.md", "# 本文", "utf-8");

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    // クリック後にアンカーは DOM に残らない
    expect(document.querySelector("a[download]")).toBeNull();

    expect(result.savedEncoding).toBe("utf-8");
  });

  // SPEC-001-R7: 元が UTF-8 なら encodingChanged=false、Shift-JIS なら true
  it("reports encodingChanged based on source encoding", () => {
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    expect(saveText("a.md", "x", "utf-8").encodingChanged).toBe(false);
    expect(saveText("a.md", "x", "shift_jis").encodingChanged).toBe(true);
  });
});
