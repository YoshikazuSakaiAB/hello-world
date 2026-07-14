import { describe, it, expect, vi, beforeEach } from "vitest";

// Mermaid は jsdom で実描画できないためモックする。
// render(id, source) を制御し、正常時は SVG を返し、特定入力で例外を投げる。
const renderMock = vi.fn();
vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: (id: string, source: string) => renderMock(id, source),
  },
}));

import { renderDiagrams } from "../../src/lib/diagramRenderer";

// markdownRenderer 相当の出力（<pre><code class="language-mermaid">…</code></pre>）を作る
function makeContainer(html: string): HTMLElement {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div;
}

const MERMAID_BLOCK = (code: string) =>
  `<pre><code class="language-mermaid">${code}</code></pre>`;

describe("renderDiagrams (SPEC-001-R4)", () => {
  beforeEach(() => {
    renderMock.mockReset();
  });

  // mermaid ブロックが無ければ render は呼ばれない
  it("does nothing when there is no mermaid block", async () => {
    const container = makeContainer("<p>本文のみ</p>");
    await renderDiagrams(container);
    expect(renderMock).not.toHaveBeenCalled();
  });

  // SPEC-001-R4 正常系: mermaid ブロックが SVG 図に置き換わる
  it("replaces a mermaid block with rendered SVG", async () => {
    renderMock.mockResolvedValue({ svg: "<svg data-test='diagram'></svg>" });
    const container = makeContainer(MERMAID_BLOCK("graph TD\n A--&gt;B"));

    await renderDiagrams(container);

    // 元の <pre> は消え、図コンテナに置換される
    expect(container.querySelector("pre")).toBeNull();
    const figure = container.querySelector(".mermaid-diagram");
    expect(figure).not.toBeNull();
    expect(figure!.querySelector("svg")).not.toBeNull();
  });

  // SPEC-001-R4 準正常系: 不正な mermaid はそのブロックのみ失敗、他は継続
  it("keeps other content when one diagram fails", async () => {
    // 1 つ目は失敗、2 つ目は成功する
    renderMock
      .mockRejectedValueOnce(new Error("syntax error"))
      .mockResolvedValueOnce({ svg: "<svg id='ok'></svg>" });

    const container = makeContainer(
      MERMAID_BLOCK("broken!!!") + MERMAID_BLOCK("graph TD\n A-->B"),
    );

    await renderDiagrams(container);

    // 失敗したブロックは元の <pre><code> のまま残る
    const remainingCode = container.querySelector("code.language-mermaid");
    expect(remainingCode?.textContent).toBe("broken!!!");
    // 成功したブロックは図に置換される
    expect(container.querySelector(".mermaid-diagram svg")).not.toBeNull();
  });
});
