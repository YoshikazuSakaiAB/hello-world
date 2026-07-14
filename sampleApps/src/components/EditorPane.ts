// SPEC-001-R3/R7: 本文の編集・再プレビュー・保存を仲介する（設計 4.6）。
// ブラウザ拡張のサンドボックスから OS 既定エディタは起動できないため、
// 拡張機能内で編集し、保存はダウンロードする方式（SPEC-001 v0.3.0）。

import { encodingLabel, type Encoding } from "../lib/fileLoader";
import { saveText } from "../lib/fileSaver";

export interface EditorPaneOptions {
  /** 編集対象の初期テキスト（フロントマター含む原文） */
  initialText: string;
  /** 読み込み時に判定した文字コード（保存時の R7 判定に使う） */
  sourceEncoding: Encoding;
  /** 保存ファイル名 */
  filename: string;
  /** 本文が変化したとき（編集中・保存後）に再プレビューを促すコールバック */
  onPreview: (text: string) => void;
  /** 保存で文字コードが変わった場合に通知メッセージを出すコールバック（R7） */
  onEncodingChanged: (message: string) => void;
}

export interface EditorPane {
  /** 編集 UI のルート要素 */
  readonly element: HTMLElement;
}

/**
 * SPEC-001-R3/R7: 編集ペインを生成する（SPEC-001 v0.8.0 で改訂）。
 * - 読み込み直後から原文を <textarea> に表示し、最初から編集可能とする（編集ボタンは設けない）。
 * - 入力のたびに onPreview で再プレビュー（R3 リアルタイム再プレビュー）。
 * - 保存ボタン押下 → UTF-8 でダウンロード（R3 保存）。元と異なる文字コードなら onEncodingChanged で通知（R7）。
 */
export function createEditorPane(options: EditorPaneOptions): EditorPane {
  const { initialText, sourceEncoding, filename, onPreview, onEncodingChanged } =
    options;

  const element = document.createElement("div");
  element.className = "editor-pane";

  // SPEC-001-R3: 本文の編集欄（読み込み直後から編集可能）
  const textarea = document.createElement("textarea");
  textarea.className = "editor-pane__textarea";
  textarea.value = initialText;

  // 保存ボタン（常時表示）
  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "editor-pane__save-button";
  saveButton.textContent = "保存";

  element.append(textarea, saveButton);

  // SPEC-001-R3: 入力のたびにリアルタイム再プレビュー
  textarea.addEventListener("input", () => {
    onPreview(textarea.value);
  });

  // SPEC-001-R3/R7: 保存 → UTF-8 でダウンロードし、文字コードが変われば通知
  saveButton.addEventListener("click", () => {
    const result = saveText(filename, textarea.value, sourceEncoding);
    if (result.encodingChanged) {
      // SPEC-001-R7: 「{元コード} から {保存コード} に変換して保存しました」形式で通知する。
      onEncodingChanged(
        `${encodingLabel(sourceEncoding)} から ${encodingLabel(result.savedEncoding)} に変換して保存しました`,
      );
    }
  });

  return { element };
}
