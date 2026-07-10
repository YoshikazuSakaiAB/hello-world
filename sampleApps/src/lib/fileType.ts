// SPEC-001-R1 / R5: 入力ファイルが対象（.md）かを判定する。
// 判定基準は拡張子 `.md` のみ（`.markdown` は対象外。SPEC-001 v0.6.0）。

export type FileKind = "markdown" | "unsupported";

/** 対象とする拡張子（小文字・ドット付き） */
const MARKDOWN_EXTENSION = ".md";

/**
 * ファイル名から拡張子を小文字で取り出す（先頭ドット付き）。
 * 拡張子がない場合は空文字を返す。
 */
function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  // ドットがない、または先頭がドット（隠しファイル等、拡張子なし扱い）
  if (dotIndex <= 0) {
    return "";
  }
  return fileName.slice(dotIndex).toLowerCase();
}

/**
 * SPEC-001-R1/R5: ファイルの種別を判定する。
 * 拡張子が `.md` のものだけを `markdown` とし、それ以外は `unsupported`。
 */
export function detectFileKind(file: File): FileKind {
  return getExtension(file.name) === MARKDOWN_EXTENSION ? "markdown" : "unsupported";
}
