import { describe, it, expect, beforeEach } from "vitest";
import { createPreviewPage } from "../../src/components/PreviewPage";

// jsdom の File.text() は環境により未実装のことがあるため、内容を持つ File を確実に作る。
function makeFile(name: string, content: string): File {
  return new File([content], name, { type: "text/markdown" });
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

describe("createPreviewPage (SPEC-001-R1/R2/R5)", () => {
  let page: ReturnType<typeof createPreviewPage>;

  beforeEach(() => {
    page = createPreviewPage();
    document.body.replaceChildren(page.element);
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
});
