// SPEC-001-R4: Markdown 中の ```mermaid コードブロックを Mermaid で図としてレンダリングする（設計 4.5）。
// PlantUML は対象外（将来対応）。構文エラー時は該当ブロックのみ失敗とし、他のプレビューは継続する。

import mermaid from "mermaid";

// Mermaid の初期化は一度だけ行う。
// startOnLoad: false … 自動走査せず、明示的に render する（プレビューは動的生成のため）。
let initialized = false;
function ensureInitialized(): void {
  if (initialized) {
    return;
  }
  // SPEC-001-R10: 画面テーマ（TokyoNight）に合わせ暗色テーマで描画する。
  mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "dark" });
  initialized = true;
}

// 一意な描画 ID を採番する（Math.random は使わずカウンタで採番）。
let diagramSeq = 0;

/**
 * SPEC-001-R4: コンテナ内の mermaid コードブロックを図に置き換える。
 * - markdownRenderer の出力では ```mermaid は `<pre><code class="language-mermaid">` になる。
 * - 各ブロックを個別に描画し、構文エラーのブロックは元表示のまま残して他は継続する（準正常系）。
 */
export async function renderDiagrams(container: HTMLElement): Promise<void> {
  const codeBlocks = container.querySelectorAll<HTMLElement>(
    "code.language-mermaid",
  );
  if (codeBlocks.length === 0) {
    return;
  }

  ensureInitialized();

  for (const code of Array.from(codeBlocks)) {
    // 描画対象は <pre><code> の <pre>。無ければ <code> 自体を置換対象にする。
    const target = code.parentElement?.tagName === "PRE" ? code.parentElement : code;
    const source = code.textContent ?? "";

    diagramSeq += 1;
    const id = `mermaid-diagram-${diagramSeq}`;

    try {
      const { svg } = await mermaid.render(id, source);
      const figure = document.createElement("div");
      figure.className = "mermaid-diagram";
      figure.innerHTML = svg;
      target.replaceWith(figure);
    } catch {
      // 構文エラー等はこのブロックのみ失敗扱い。元のコード表示を残し、他ブロックは継続する。
    }
  }
}
