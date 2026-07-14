import { describe, it, expect } from "vitest";
import { createFrontMatterView } from "../../src/components/FrontMatterView";

describe("createFrontMatterView (SPEC-001-R9)", () => {
  // SPEC-001-R9 準正常系: entries が空なら何も描画しない
  it("renders nothing when there are no entries", () => {
    const view = createFrontMatterView([]);
    expect(view.element).toBeNull();
  });

  // SPEC-001-R9 正常系: 既定は折りたたみ（閉じた <details>）
  it("renders a collapsed <details> by default", () => {
    const view = createFrontMatterView([{ key: "title", value: "デモ" }]);
    const el = view.element as HTMLDetailsElement;
    expect(el.tagName).toBe("DETAILS");
    // open 属性が無い＝閉じている（既定は非表示）
    expect(el.open).toBe(false);
    expect(el.querySelector("summary")?.textContent).toBe("フロントマター");
  });

  // SPEC-001-R9 正常系: 展開すると key/value の表が見える
  it("shows key/value rows in a table", () => {
    const view = createFrontMatterView([
      { key: "title", value: "デモ" },
      { key: "paginate", value: "true" },
    ]);
    const el = view.element as HTMLElement;

    const rows = Array.from(el.querySelectorAll("table tbody tr"));
    expect(rows).toHaveLength(2);

    expect(rows[0]?.querySelector("th")?.textContent).toBe("title");
    expect(rows[0]?.querySelector("td")?.textContent).toBe("デモ");
    expect(rows[1]?.querySelector("th")?.textContent).toBe("paginate");
    expect(rows[1]?.querySelector("td")?.textContent).toBe("true");
  });

  // 値はテキストとして設定され、HTML として解釈されない（XSS 混入防止）
  it("sets values as text, not HTML", () => {
    const view = createFrontMatterView([
      { key: "x", value: "<b>bold</b>" },
    ]);
    const td = (view.element as HTMLElement).querySelector("td")!;
    // textContent で入れているのでタグは実体化しない
    expect(td.querySelector("b")).toBeNull();
    expect(td.textContent).toBe("<b>bold</b>");
  });
});
