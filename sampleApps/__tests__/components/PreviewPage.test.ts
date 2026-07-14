import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { convert } from "encoding-japanese";
import { createPreviewPage } from "../../src/components/PreviewPage";

// jsdom の File.text() は環境により未実装のことがあるため、内容を持つ File を確実に作る。
function makeFile(name: string, content: string): File {
  return new File([content], name, { type: "text/markdown" });
}

// Shift-JIS バイト列の File を作るヘルパー（R6 の検証用）
function makeShiftJisFile(name: string, content: string): File {
  const bytes = Uint8Array.from(
    convert(content, { to: "SJIS", from: "UNICODE", type: "array" }),
  );
  return new File([bytes], name, { type: "text/markdown" });
}

// drop イベントを発火してファイルを流し込むヘルパー
function drop(element: HTMLElement, file: File): void {
  const event = new Event("drop", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "dataTransfer", { value: { files: [file] } });
  element.dispatchEvent(event);
}

// 非同期の読み込み（file.text()）が反映されるまで待つ。
// 条件が満たされるか一定回数を超えたら解決する。
async function waitFor(check: () => boolean): Promise<void> {
  for (let i = 0; i < 50; i++) {
    if (check()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

// size を上書きした File を作る（実バイトを確保せず上限超過を再現する）
function makeOversizedFile(name: string): File {
  const file = new File(["x"], name, { type: "text/markdown" });
  Object.defineProperty(file, "size", { value: 5_242_880 + 1 });
  return file;
}

describe("createPreviewPage (SPEC-001-R1/R2/R3/R5/R6/R7/R8/R9)", () => {
  let page: ReturnType<typeof createPreviewPage>;

  beforeEach(() => {
    page = createPreviewPage();
    document.body.replaceChildren(page.element);
    // 保存（ダウンロード）で使う URL API を jsdom 向けにスタブ
    URL.createObjectURL = vi.fn(() => "blob:mock");
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // SPEC-001-R1/R2 正常系: .md をドロップするとプレビューされる
  it("renders markdown preview for a dropped .md file", async () => {
    const dropZone = page.element.querySelector(".file-drop-zone") as HTMLElement;
    drop(dropZone, makeFile("note.md", "# 見出し"));

    // handleFile は非同期（file.text()）のため反映を待つ
    const content = page.element.querySelector(".preview-page__content")!;
    await waitFor(() => content.innerHTML.includes("<h1>"));

    expect(content.innerHTML).toContain("<h1>見出し</h1>");
    const banner = page.element.querySelector(".error-banner") as HTMLElement;
    expect(banner.hidden).toBe(true);
  });

  // SPEC-001-R5 異常系: .md 以外はエラー表示、プレビューしない
  it("shows error and does not preview for a non-.md file", async () => {
    const dropZone = page.element.querySelector(".file-drop-zone") as HTMLElement;
    drop(dropZone, makeFile("note.txt", "# 見出し"));

    const banner = page.element.querySelector(".error-banner") as HTMLElement;
    await waitFor(() => banner.hidden === false);

    expect(banner.hidden).toBe(false);
    expect(banner.textContent).toBe(".md ファイルを選択してください");
    const content = page.element.querySelector(".preview-page__content")!;
    expect(content.innerHTML).toBe("");
  });

  // 対象外ファイルの後に .md を読み込むとエラーが消え、プレビューされる
  it("clears the error when a valid file is loaded after an invalid one", async () => {
    const dropZone = page.element.querySelector(".file-drop-zone") as HTMLElement;
    const banner = page.element.querySelector(".error-banner") as HTMLElement;
    const content = page.element.querySelector(".preview-page__content")!;

    drop(dropZone, makeFile("note.txt", "x"));
    await waitFor(() => banner.hidden === false);
    drop(dropZone, makeFile("note.md", "**太字**"));
    await waitFor(() => content.innerHTML.includes("<strong>"));

    expect(banner.hidden).toBe(true);
    expect(content.innerHTML).toContain("<strong>太字</strong>");
  });

  // SPEC-001-R9 正常系: フロントマター付き .md は、折りたたみ（既定閉）＋本文プレビュー
  it("shows a collapsed front matter view and previews the body", async () => {
    const dropZone = page.element.querySelector(".file-drop-zone") as HTMLElement;
    const content = page.element.querySelector(".preview-page__content")!;
    drop(dropZone, makeFile("slide.md", "---\ntitle: デモ\n---\n# 本文見出し"));

    await waitFor(() => content.querySelector(".preview-page__body h1") !== null);

    // フロントマターは折りたたみ（既定は閉じている）で本文の前に配置される
    const details = content.querySelector("details.front-matter") as HTMLDetailsElement;
    expect(details).not.toBeNull();
    expect(details.open).toBe(false);
    expect(details.querySelector("th")?.textContent).toBe("title");
    expect(details.querySelector("td")?.textContent).toBe("デモ");

    // 本文はフロントマターを含まずプレビューされる
    const body = content.querySelector(".preview-page__body")!;
    expect(body.innerHTML).toContain("<h1>本文見出し</h1>");
    expect(body.innerHTML).not.toContain("title");
  });

  // SPEC-001-R9 準正常系: フロントマターが無ければ折りたたみは表示されない
  it("does not show a front matter view when there is none", async () => {
    const dropZone = page.element.querySelector(".file-drop-zone") as HTMLElement;
    const content = page.element.querySelector(".preview-page__content")!;
    drop(dropZone, makeFile("note.md", "# 見出しのみ"));

    await waitFor(() => content.querySelector(".preview-page__body h1") !== null);

    expect(content.querySelector("details.front-matter")).toBeNull();
  });

  // SPEC-001-R6 正常系: Shift-JIS の .md も文字化けなくプレビューされる
  it("previews a Shift-JIS encoded .md without garbling", async () => {
    const dropZone = page.element.querySelector(".file-drop-zone") as HTMLElement;
    const content = page.element.querySelector(".preview-page__content")!;
    drop(dropZone, makeShiftJisFile("sjis.md", "# 日本語見出し"));

    await waitFor(() => content.querySelector(".preview-page__body h1") !== null);

    const body = content.querySelector(".preview-page__body")!;
    expect(body.innerHTML).toContain("<h1>日本語見出し</h1>");
  });

  // SPEC-001-R8 異常系: 上限超過は警告し、プレビューしない
  it("shows a warning and does not preview an oversized file", async () => {
    const dropZone = page.element.querySelector(".file-drop-zone") as HTMLElement;
    const banner = page.element.querySelector(".error-banner") as HTMLElement;
    const content = page.element.querySelector(".preview-page__content")!;
    drop(dropZone, makeOversizedFile("big.md"));

    await waitFor(() => banner.hidden === false);

    expect(banner.hidden).toBe(false);
    expect(banner.textContent).toContain("上限");
    expect(content.innerHTML).toBe("");
  });

  // SPEC-001-R8 準正常系: 空ファイルは空プレビュー（エラーにしない）
  it("shows an empty preview for an empty file without error", async () => {
    const dropZone = page.element.querySelector(".file-drop-zone") as HTMLElement;
    const banner = page.element.querySelector(".error-banner") as HTMLElement;
    const content = page.element.querySelector(".preview-page__content")!;
    drop(dropZone, makeFile("empty.md", ""));

    // 本文コンテナが生成される（＝正常フローに進んだ）まで待つ
    await waitFor(() => content.querySelector(".preview-page__body") !== null);

    // エラーは出ず、本文は空、フロントマターも無い
    expect(banner.hidden).toBe(true);
    const body = content.querySelector(".preview-page__body")!;
    expect(body.innerHTML.trim()).toBe("");
    expect(content.querySelector("details.front-matter")).toBeNull();
  });

  // SPEC-001-R3 正常系: 最初から編集可能な textarea を編集するとリアルタイムで再プレビューされる
  it("re-previews edited content in real time (R3)", async () => {
    const dropZone = page.element.querySelector(".file-drop-zone") as HTMLElement;
    const content = page.element.querySelector(".preview-page__content")!;
    drop(dropZone, makeFile("note.md", "# 元見出し"));
    await waitFor(() => content.querySelector(".preview-page__body h1") !== null);

    // 編集ボタンは無い。読み込み直後から編集可能な textarea を直接編集 → input で再プレビュー
    expect(page.element.querySelector(".editor-pane__edit-button")).toBeNull();
    const textarea = page.element.querySelector("textarea") as HTMLTextAreaElement;
    textarea.value = "# 変更後見出し";
    textarea.dispatchEvent(new Event("input"));

    const body = content.querySelector(".preview-page__body")!;
    expect(body.innerHTML).toContain("<h1>変更後見出し</h1>");
    expect(body.innerHTML).not.toContain("元見出し");
  });

  // SPEC-001-R7 正常系（変わる）: Shift-JIS を読み込んで保存すると通知が出る
  it("notifies encoding change when saving a Shift-JIS file (R7)", async () => {
    const dropZone = page.element.querySelector(".file-drop-zone") as HTMLElement;
    const content = page.element.querySelector(".preview-page__content")!;
    const notice = page.element.querySelector(".notice") as HTMLElement;
    drop(dropZone, makeShiftJisFile("sjis.md", "# 日本語"));
    await waitFor(() => content.querySelector(".preview-page__body h1") !== null);

    // 通知は最初は非表示
    expect(notice.hidden).toBe(true);

    // 保存 → UTF-8 に変わるため通知される
    (page.element.querySelector(".editor-pane__save-button") as HTMLButtonElement).click();
    expect(notice.hidden).toBe(false);
    // SPEC-001-R7: 「Shift-JIS から UTF-8 に変換して保存しました」形式
    expect(notice.textContent).toBe("Shift-JIS から UTF-8 に変換して保存しました");
  });

  // SPEC-001-R7 正常系（変わらない）: UTF-8 を保存しても通知は出ない
  it("does not notify when saving a UTF-8 file (R7)", async () => {
    const dropZone = page.element.querySelector(".file-drop-zone") as HTMLElement;
    const content = page.element.querySelector(".preview-page__content")!;
    const notice = page.element.querySelector(".notice") as HTMLElement;
    drop(dropZone, makeFile("utf8.md", "# 日本語"));
    await waitFor(() => content.querySelector(".preview-page__body h1") !== null);

    (page.element.querySelector(".editor-pane__save-button") as HTMLButtonElement).click();
    expect(notice.hidden).toBe(true);
  });
});
