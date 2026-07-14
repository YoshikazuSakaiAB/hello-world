// SPEC-001-R1/R2/R3/R4/R5/R6/R7/R8/R9: プレビュー画面のトップ。
// FileDropZone でファイルを受け取り、種別判定(R1/R5)→サイズ検証(R8)→文字コード判定読み込み(R6)→フロントマター分離(R9)→Markdown 変換(R2)→Mermaid 図描画(R4)→表示 を仲介する。
// 読み込み後は編集・保存(R3)・文字コード変更通知(R7)を EditorPane/Notice で提供する（設計 4.8 PreviewPage）。

import { detectFileKind } from "../lib/fileType";
import { validateFile } from "../lib/fileValidator";
import { readTextFile } from "../lib/fileLoader";
import { parseFrontMatter } from "../lib/frontMatter";
import { renderMarkdown } from "../lib/markdownRenderer";
import { renderDiagrams } from "../lib/diagramRenderer";
import { createFileDropZone } from "./FileDropZone";
import { createErrorBanner } from "./ErrorBanner";
import { createFrontMatterView } from "./FrontMatterView";
import { createEditorPane } from "./EditorPane";
import { createNotice } from "./Notice";

// SPEC-001-R5: 対象外ファイルのエラーメッセージ（受入れ条件の文言に一致させる）
const UNSUPPORTED_MESSAGE = ".md ファイルを選択してください";
// SPEC-001-R8: サイズ上限超過の警告メッセージ
const TOO_LARGE_MESSAGE = "ファイルサイズが上限（5MB）を超えています";

export interface PreviewPage {
  /** プレビュー画面のルート要素 */
  readonly element: HTMLElement;
}

/**
 * SPEC-001-R1/R2/R3/R5/R6/R7/R8/R9: プレビュー画面を生成する。
 * ファイル受領 → 種別判定 → サイズ検証 → 文字コード判定読み込み → フロントマター分離 → プレビュー表示。
 * 読み込み後は編集・保存(R3)・文字コード変更通知(R7)を提供する。
 */
export function createPreviewPage(): PreviewPage {
  const element = document.createElement("div");
  element.className = "preview-page";

  const errorBanner = createErrorBanner();
  // SPEC-001-R7: 文字コード変更などの情報通知
  const notice = createNotice();

  // SPEC-001-R3: 編集 UI を差し込む領域（ファイル読み込みごとに再構築する）
  const editorSlot = document.createElement("div");
  editorSlot.className = "preview-page__editor";

  // SPEC-001-R2: 変換後 HTML を表示する領域
  const preview = document.createElement("div");
  preview.className = "preview-page__content";

  const dropZone = createFileDropZone((file) => {
    void handleFile(file);
  });

  element.append(
    dropZone.element,
    errorBanner.element,
    notice.element,
    editorSlot,
    preview,
  );

  /**
   * SPEC-001-R2/R9: テキスト（原文）をフロントマター分離＋Markdown 変換して表示領域に描画する。
   * 編集時の再プレビュー（R3）でも再利用する。
   */
  function renderContent(text: string): void {
    // SPEC-001-R9: 先頭フロントマターを本文と分離する
    const { entries, body } = parseFrontMatter(text);

    preview.replaceChildren();

    // SPEC-001-R9: フロントマターがあれば折りたたみを本文の先頭に配置（無ければ何も足さない）
    const frontMatterView = createFrontMatterView(entries);
    if (frontMatterView.element) {
      preview.appendChild(frontMatterView.element);
    }

    // SPEC-001-R2: 本文（フロントマター除去済み）を安全化済み HTML に変換して表示
    const bodyContainer = document.createElement("div");
    bodyContainer.className = "preview-page__body";
    bodyContainer.innerHTML = renderMarkdown(body);
    preview.appendChild(bodyContainer);

    // SPEC-001-R4: mermaid コードブロックを図に描画する（非同期。失敗ブロックは元表示のまま継続）。
    void renderDiagrams(bodyContainer);
  }

  /**
   * ファイルを受け取り、種別判定→表示までを行う。
   */
  async function handleFile(file: File): Promise<void> {
    // SPEC-001-R5: .md 以外は拒否し、プレビューを実施しない
    if (detectFileKind(file) === "unsupported") {
      preview.replaceChildren();
      editorSlot.replaceChildren();
      notice.clear();
      errorBanner.show(UNSUPPORTED_MESSAGE);
      return;
    }

    // SPEC-001-R8: サイズ上限を超える場合は警告し、プレビューを実施しない
    const validation = validateFile(file);
    if (!validation.ok) {
      preview.replaceChildren();
      editorSlot.replaceChildren();
      notice.clear();
      errorBanner.show(TOO_LARGE_MESSAGE);
      return;
    }

    // 正常系: エラー・通知表示をクリアしてから読み込む
    // （空ファイル（validation.isEmpty）はエラーにせず、空の本文として通常フローに進む。R8 準正常系）
    errorBanner.clear();
    notice.clear();

    // SPEC-001-R6: 文字コードを自動判定（UTF-8/Shift-JIS）してデコードする
    const { text, encoding } = await readTextFile(file);

    // SPEC-001-R2/R9: プレビューを描画
    renderContent(text);

    // SPEC-001-R3/R7: 編集ペインを（再）構築する。編集時は再プレビュー、保存時は encoding 変更を通知。
    const editorPane = createEditorPane({
      initialText: text,
      sourceEncoding: encoding,
      filename: file.name,
      onPreview: renderContent,
      onEncodingChanged: (message) => notice.show(message),
    });
    editorSlot.replaceChildren(editorPane.element);
  }

  return { element };
}
