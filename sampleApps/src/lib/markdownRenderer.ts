// SPEC-001-R2: Markdown（CommonMark + GFM）テキストを安全な HTML に変換する。
// 入力は fileLoader でデコード済みの文字列（文字コード差異はこの層に持ち込まない。設計 4.4）。

import MarkdownIt from "markdown-it";
import taskLists from "markdown-it-task-lists";
import DOMPurify from "dompurify";

// markdown-it の設定。
// - html: true … 本文中の生 HTML を通すが、最終的に DOMPurify でサニタイズする（設計 4.4 セキュリティ）。
// - linkify: true … URL を自動リンク化（GFM 相当）。
// - 表・打消し線・コードブロックは markdown-it 標準で有効（GFM 相当）。
const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false,
});

// SPEC-001-R2: タスクリスト（`- [ ]` / `- [x]`）をチェックボックスとして描画する。
// enabled: false … プレビュー用途のため読み取り専用（クリック不可）。
md.use(taskLists, { enabled: false });

/**
 * SPEC-001-R2: Markdown 文字列を安全化済み HTML 文字列に変換する。
 * - `# 見出し`→`<h1>`、`**太字**`→`<strong>`、`- 箇条書き`→`<ul><li>`（受入れ条件）。
 * - 表・コードブロック・タスクリスト（チェックボックス）等の GFM 記法に対応。
 * - Markdown として解釈できない行はプレーンテキストとしてそのまま出力される（markdown-it 既定挙動）。
 * - 変換後 HTML は XSS 対策のため DOMPurify でサニタイズする。
 */
export function renderMarkdown(source: string): string {
  const rawHtml = md.render(source);
  // タスクリストの <input type="checkbox"> を許可するためサニタイズ設定を明示する。
  return DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ["input"],
    ADD_ATTR: ["type", "checked", "disabled"],
  });
}
