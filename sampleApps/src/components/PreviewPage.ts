// SPEC-001-R1/R2/R5: プレビュー画面のトップ。
// FileDropZone でファイルを受け取り、種別判定(R1/R5)→Markdown 変換(R2)→表示 を仲介する（設計 4.8 PreviewPage）。

import { detectFileKind } from "../lib/fileType";
import { renderMarkdown } from "../lib/markdownRenderer";
import { createFileDropZone } from "./FileDropZone";
import { createErrorBanner } from "./ErrorBanner";

// SPEC-001-R5: 対象外ファイルのエラーメッセージ（受入れ条件の文言に一致させる）
const UNSUPPORTED_MESSAGE = ".md ファイルを選択してください";

export interface PreviewPage {
  /** プレビュー画面のルート要素 */
  readonly element: HTMLElement;
}

/**
 * SPEC-001-R1/R2/R5: プレビュー画面を生成する。
 * ファイル受領 → 種別判定 → プレビュー表示（またはエラー表示）までを組み立てる。
 * MVP 第1段のため、読み込みは UTF-8 前提（File.text()）とする。文字コード判定(R6)は後続で fileLoader に置き換える。
 */
export function createPreviewPage(): PreviewPage {
  const element = document.createElement("div");
  element.className = "preview-page";

  const errorBanner = createErrorBanner();

  // SPEC-001-R2: 変換後 HTML を表示する領域
  const preview = document.createElement("div");
  preview.className = "preview-page__content";

  const dropZone = createFileDropZone((file) => {
    void handleFile(file);
  });

  element.append(dropZone.element, errorBanner.element, preview);

  /**
   * ファイルを受け取り、種別判定→表示までを行う。
   */
  async function handleFile(file: File): Promise<void> {
    // SPEC-001-R5: .md 以外は拒否し、プレビューを実施しない
    if (detectFileKind(file) === "unsupported") {
      preview.innerHTML = "";
      errorBanner.show(UNSUPPORTED_MESSAGE);
      return;
    }

    // 正常系: エラー表示をクリアしてから読み込む
    errorBanner.clear();

    // MVP 第1段: UTF-8 前提で読み込む（R6 の文字コード判定は後続対応）
    const text = await file.text();

    // SPEC-001-R2: Markdown を安全化済み HTML に変換して表示
    preview.innerHTML = renderMarkdown(text);
  }

  return { element };
}
