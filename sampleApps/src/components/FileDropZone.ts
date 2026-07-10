// SPEC-001-R1 / R5: プレビュー画面上のドロップ領域とファイル選択ダイアログでファイルを受け取る。
// Manifest V3 ではツールバーアイコンへのネイティブ D&D は非対応のため、
// ドロップ先はプレビュー画面の領域とする（設計 4.8 FileDropZone / SPEC-001 v0.6.0）。

export interface FileDropZone {
  /** ドロップ領域のルート要素 */
  readonly element: HTMLElement;
}

/**
 * SPEC-001-R1: ドラッグ＆ドロップおよびダイアログでファイルを受け取るコンポーネントを生成する。
 * 受け取ったファイルは `onFile` コールバックに渡す（種別判定・読み込みは上位が担う）。
 */
export function createFileDropZone(onFile: (file: File) => void): FileDropZone {
  const element = document.createElement("div");
  element.className = "file-drop-zone";

  // ダイアログ用の非表示 input（クリックで開く）
  const input = document.createElement("input");
  input.type = "file";
  // .md を優先候補にするが、R5 の拒否は種別判定側で行うため制限しすぎない
  input.accept = ".md,text/markdown";
  input.className = "file-drop-zone__input";
  input.hidden = true;

  const message = document.createElement("p");
  message.className = "file-drop-zone__message";
  message.textContent = "ここに .md ファイルをドロップ、またはクリックして選択";

  element.append(message, input);

  // クリックでダイアログを開く（領域内クリックを input へ委譲）
  element.addEventListener("click", () => {
    input.click();
  });

  // ダイアログでファイルが選ばれたとき（SPEC-001-R1 正常系: ダイアログ）
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (file) {
      onFile(file);
    }
    // 同じファイルを連続選択しても change が発火するようリセット
    input.value = "";
  });

  // ドラッグ中は既定動作（ブラウザがファイルを開く）を抑止する
  element.addEventListener("dragover", (event) => {
    event.preventDefault();
    element.classList.add("file-drop-zone--dragover");
  });
  element.addEventListener("dragleave", () => {
    element.classList.remove("file-drop-zone--dragover");
  });

  // ドロップ時（SPEC-001-R1 正常系: D&D）
  element.addEventListener("drop", (event) => {
    event.preventDefault();
    element.classList.remove("file-drop-zone--dragover");
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      onFile(file);
    }
  });

  return { element };
}
