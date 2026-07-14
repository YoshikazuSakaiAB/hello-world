import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createEditorPane, type EditorPaneOptions } from "../../src/components/EditorPane";

function makeOptions(overrides: Partial<EditorPaneOptions> = {}): EditorPaneOptions {
  return {
    initialText: "# 原文",
    sourceEncoding: "utf-8",
    filename: "note.md",
    onPreview: vi.fn(),
    onEncodingChanged: vi.fn(),
    ...overrides,
  };
}

describe("createEditorPane (SPEC-001-R3/R7)", () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => "blob:mock");
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // SPEC-001-R3 正常系: 編集ボタンで textarea が編集可能状態になる
  it("shows an editable textarea when the edit button is clicked", () => {
    const pane = createEditorPane(makeOptions());
    const textarea = pane.element.querySelector("textarea") as HTMLTextAreaElement;
    const editButton = pane.element.querySelector(
      ".editor-pane__edit-button",
    ) as HTMLButtonElement;

    expect(textarea.hidden).toBe(true);
    editButton.click();
    expect(textarea.hidden).toBe(false);
    expect(textarea.value).toBe("# 原文");
  });

  // SPEC-001-R3 正常系: 入力すると onPreview が変更後テキストで呼ばれる（再プレビュー）
  it("calls onPreview with the edited text on input", () => {
    const onPreview = vi.fn();
    const pane = createEditorPane(makeOptions({ onPreview }));
    const textarea = pane.element.querySelector("textarea") as HTMLTextAreaElement;

    textarea.value = "# 変更後";
    textarea.dispatchEvent(new Event("input"));

    expect(onPreview).toHaveBeenCalledWith("# 変更後");
  });

  // SPEC-001-R3 正常系: 保存ボタンでダウンロードが起動する
  it("triggers a download when the save button is clicked", () => {
    const pane = createEditorPane(makeOptions());
    const saveButton = pane.element.querySelector(
      ".editor-pane__save-button",
    ) as HTMLButtonElement;

    saveButton.click();
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  // SPEC-001-R7 正常系（変わらない）: UTF-8 読み込みでは通知しない
  it("does not notify when source encoding is utf-8", () => {
    const onEncodingChanged = vi.fn();
    const pane = createEditorPane(makeOptions({ sourceEncoding: "utf-8", onEncodingChanged }));
    (pane.element.querySelector(".editor-pane__save-button") as HTMLButtonElement).click();
    expect(onEncodingChanged).not.toHaveBeenCalled();
  });

  // SPEC-001-R7 正常系（変わる）: Shift-JIS 読み込みでは保存時に通知する
  it("notifies when source encoding differs from utf-8", () => {
    const onEncodingChanged = vi.fn();
    const pane = createEditorPane(
      makeOptions({ sourceEncoding: "shift_jis", onEncodingChanged }),
    );
    (pane.element.querySelector(".editor-pane__save-button") as HTMLButtonElement).click();

    expect(onEncodingChanged).toHaveBeenCalledTimes(1);
    // SPEC-001-R7: 「Shift-JIS から UTF-8 に変換して保存しました」形式
    expect(onEncodingChanged.mock.calls[0]?.[0]).toBe(
      "Shift-JIS から UTF-8 に変換して保存しました",
    );
  });
});
