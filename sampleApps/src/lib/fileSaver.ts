// SPEC-001-R3/R7: 編集後テキストをファイルとしてダウンロード保存する（設計 4.7）。
// 保存は UTF-8 に統一（標準 TextEncoder が UTF-8 のみのため。SPEC-001 v0.5.0）。
// 元ファイルへの直接上書きは対象外（別ファイルへのダウンロード）。

import type { Encoding } from "./fileLoader";

// 保存時に書き出す文字コード（UTF-8 固定）。
const SAVE_ENCODING: Encoding = "utf-8";

export interface SaveResult {
  /** 実際に書き出した文字コード（当面は 'utf-8'） */
  savedEncoding: Encoding;
  /** 元 encoding と異なる場合 true（R7 判定） */
  encodingChanged: boolean;
}

/**
 * SPEC-001-R7: 保存で文字コードが変わるか判定する。
 * 保存は UTF-8 固定のため、元が UTF-8 以外なら changed = true。
 */
export function isEncodingChanged(sourceEncoding: Encoding): boolean {
  return sourceEncoding !== SAVE_ENCODING;
}

/**
 * SPEC-001-R3/R7: テキストを UTF-8 のファイルとしてダウンロード保存する。
 * - Blob(UTF-8) + URL.createObjectURL + <a download> でダウンロードを起動する。
 * - 戻り値で保存文字コードと、元と異なるか（encodingChanged）を返す（R7 通知の判定に使う）。
 */
export function saveText(
  filename: string,
  text: string,
  sourceEncoding: Encoding,
): SaveResult {
  // Blob は既定で UTF-8 として書き出される。
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  // DOM に一時追加してクリック → 除去（一部ブラウザで append が必要）
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  // 生成した Object URL は解放する。
  URL.revokeObjectURL(url);

  return {
    savedEncoding: SAVE_ENCODING,
    encodingChanged: isEncodingChanged(sourceEncoding),
  };
}
