import { describe, it, expect } from "vitest";
import { renderMarkdown } from "../../src/lib/markdownRenderer";

describe("renderMarkdown (SPEC-001-R2)", () => {
  // SPEC-001-R2 正常系: 基本記法の変換（受入れ条件）
  it("converts heading / bold / list to HTML", () => {
    const html = renderMarkdown("# 見出し\n\n**太字**\n\n- 箇条書き");
    expect(html).toContain("<h1>見出し</h1>");
    expect(html).toContain("<strong>太字</strong>");
    expect(html).toMatch(/<ul>[\s\S]*<li>箇条書き<\/li>[\s\S]*<\/ul>/);
  });

  // SPEC-001-R2: GFM の表を変換できる
  it("converts a GFM table", () => {
    const source = ["| A | B |", "|---|---|", "| 1 | 2 |"].join("\n");
    const html = renderMarkdown(source);
    expect(html).toContain("<table>");
    expect(html).toContain("<th>A</th>");
    expect(html).toContain("<td>1</td>");
  });

  // SPEC-001-R2: コードブロックを変換できる
  it("converts a fenced code block", () => {
    const html = renderMarkdown("```\nconst x = 1;\n```");
    expect(html).toContain("<pre>");
    expect(html).toContain("<code>");
    expect(html).toContain("const x = 1;");
  });

  // SPEC-001-R2: タスクリスト（チェックボックス）を変換できる
  it("converts task lists to checkboxes", () => {
    const html = renderMarkdown("- [ ] 未完了\n- [x] 完了");
    expect(html).toContain('type="checkbox"');
    // 完了項目は checked が付与される
    expect(html).toMatch(/checked/);
  });

  // SPEC-001-R2: 裸の URL は自動リンク化される（GFM 相当・linkify）
  it("auto-links a bare URL", () => {
    const html = renderMarkdown("詳しくは https://example.com を参照");
    expect(html).toContain('<a href="https://example.com">');
  });

  // SPEC-001-R2 準正常系: 解釈できない行はプレーンテキストとして残る（エラーにならない）
  it("keeps non-markdown text as plain text without error", () => {
    const html = renderMarkdown("これは普通の文章です。");
    expect(html).toContain("これは普通の文章です。");
  });

  // セキュリティ: <script> などの危険な HTML はサニタイズで除去される（設計 4.4）
  it("sanitizes dangerous HTML (XSS)", () => {
    const html = renderMarkdown('<script>alert("xss")</script>\n\n通常テキスト');
    expect(html).not.toContain("<script>");
    expect(html).toContain("通常テキスト");
  });

  // 空文字列は空文字列を返す（R8 空ファイルの空プレビューに整合）
  it("returns empty output for empty input", () => {
    expect(renderMarkdown("").trim()).toBe("");
  });
});
