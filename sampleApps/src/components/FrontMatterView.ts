// SPEC-001-R9: フロントマターの折りたたみ表示。
// 既定は折りたたみ非表示（<details> 閉）、展開すると key/value の表を表示する（設計 4.10）。

import type { FrontMatterEntry } from "../lib/frontMatter";

export interface FrontMatterView {
  /** 折りたたみのルート要素。entries が空の場合は null（何も描画しない） */
  readonly element: HTMLElement | null;
}

/**
 * SPEC-001-R9: フロントマターの折りたたみコンポーネントを生成する。
 * - entries が空（フロントマター無し）の場合は `element: null` を返し、何も描画しない（準正常系）。
 * - entries があれば既定で閉じた `<details>` を生成し、展開すると key/value の `<table>` を表示する。
 */
export function createFrontMatterView(entries: FrontMatterEntry[]): FrontMatterView {
  if (entries.length === 0) {
    return { element: null };
  }

  const details = document.createElement("details");
  details.className = "front-matter";
  // 既定は閉じた状態（折りたたみ非表示）。open 属性を付けない。

  const summary = document.createElement("summary");
  summary.className = "front-matter__summary";
  summary.textContent = "フロントマター";
  details.appendChild(summary);

  // key/value の表
  const table = document.createElement("table");
  table.className = "front-matter__table";

  const tbody = document.createElement("tbody");
  for (const { key, value } of entries) {
    const row = document.createElement("tr");

    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = key;

    const td = document.createElement("td");
    // 複数行の値も改行を保持して表示できるよう <td> に委ねる（CSS の white-space で制御）
    td.textContent = value;

    row.append(th, td);
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  details.appendChild(table);

  return { element: details };
}
