import { describe, it, expect } from "vitest";
import { parseFrontMatter } from "../../src/lib/frontMatter";

describe("parseFrontMatter (SPEC-001-R9)", () => {
  // SPEC-001-R9 正常系: 先頭フロントマターを body と entries に分離する
  it("separates front matter from the body", () => {
    const source = "---\ntitle: デモ\npaginate: true\n---\n# 本文見出し\n\n段落";
    const { entries, body } = parseFrontMatter(source);

    expect(entries).toEqual([
      { key: "title", value: "デモ" },
      { key: "paginate", value: "true" },
    ]);
    // body にフロントマターが残らず、本文だけになる
    expect(body).toBe("# 本文見出し\n\n段落");
    expect(body).not.toContain("title:");
  });

  // SPEC-001-R9: 複数行ブロック値（style: |）を解析できる
  it("parses a multi-line block scalar value", () => {
    const source =
      "---\ntitle: T\nstyle: |\n  section { font-size: 24px; }\n  h1 { color: #1a3c6e; }\n---\n本文";
    const { entries, body } = parseFrontMatter(source);

    const style = entries.find((e) => e.key === "style");
    expect(style?.value).toBe(
      "section { font-size: 24px; }\nh1 { color: #1a3c6e; }",
    );
    expect(body).toBe("本文");
  });

  // SPEC-001-R9 準正常系: フロントマターが無ければ body は source 全体
  it("returns the whole source as body when there is no front matter", () => {
    const source = "# 見出し\n\n本文のみ";
    const { entries, body } = parseFrontMatter(source);
    expect(entries).toEqual([]);
    expect(body).toBe(source);
  });

  // 本文中（先頭以外）の --- は区切り線であり、フロントマターとして分離しない
  it("does not treat a horizontal rule in the body as front matter", () => {
    const source = "# 見出し\n\n---\n\n次の節";
    const { entries, body } = parseFrontMatter(source);
    expect(entries).toEqual([]);
    expect(body).toBe(source);
  });

  // 不正な YAML はフロントマター無しとして扱い、本文全体を維持する（エラーにしない）
  it("treats invalid YAML as no front matter", () => {
    const source = "---\n: : : invalid : :\n  - broken\n---\n本文";
    const { entries, body } = parseFrontMatter(source);
    expect(entries).toEqual([]);
    expect(body).toBe(source);
  });

  // 終了区切りが ... の場合も分離できる
  it("supports '...' as the closing delimiter", () => {
    const source = "---\ntitle: T\n...\n本文";
    const { entries, body } = parseFrontMatter(source);
    expect(entries).toEqual([{ key: "title", value: "T" }]);
    expect(body).toBe("本文");
  });

  // オブジェクト/配列の値は JSON 文字列に整形する
  it("stringifies object/array values as JSON", () => {
    const source = "---\ntags:\n  - a\n  - b\n---\n本文";
    const { entries } = parseFrontMatter(source);
    expect(entries).toEqual([{ key: "tags", value: '["a","b"]' }]);
  });
});
