// SPEC-001-R1/R6: File オブジェクトからテキストを読み込む。
// 入力ファイルの文字コードは UTF-8 とは限らず Shift-JIS の可能性もあるため、
// エンコーディングを判定してからデコードする（設計 4.3）。

import { detect } from "encoding-japanese";

// 対応するエンコーディング（SPEC-001 v0.5.0 で確定。2 種）。
export type Encoding = "utf-8" | "shift_jis";

// SPEC-001-R7: 通知メッセージ等で用いるユーザー向けの表示名。
const ENCODING_LABELS: Record<Encoding, string> = {
  "utf-8": "UTF-8",
  shift_jis: "Shift-JIS",
};

/** エンコーディングのユーザー向け表示名を返す（例: 'shift_jis' → 'Shift-JIS'）。 */
export function encodingLabel(encoding: Encoding): string {
  return ENCODING_LABELS[encoding];
}

export interface LoadedFile {
  /** デコード済みテキスト（内部表現は常に UTF-16 文字列） */
  text: string;
  /** 判定・使用したエンコーディング（保存時に再利用。R3/R7） */
  encoding: Encoding;
}

/**
 * バイト列から対応エンコーディングを判定する。
 * encoding-japanese の detect が 'SJIS' を返したときのみ Shift-JIS とし、
 * それ以外（UTF8・ASCII・判定不能など）は UTF-8 として扱う（SPEC-001-R6）。
 */
export function detectEncoding(bytes: Uint8Array): Encoding {
  const detected = detect(bytes);
  return detected === "SJIS" ? "shift_jis" : "utf-8";
}

/**
 * SPEC-001-R1/R6: File からテキストを読み込む。
 * 1. ArrayBuffer として読み込む（即 decode しない）。
 * 2. バイト列から文字コードを判定する（UTF-8/Shift-JIS。不能時は UTF-8）。
 * 3. TextDecoder でデコードして UTF-16 文字列に統一する。
 */
export async function readTextFile(file: File): Promise<LoadedFile> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const encoding = detectEncoding(bytes);
  // TextDecoder のラベルは 'utf-8' / 'shift_jis' をそのまま使える。
  const text = new TextDecoder(encoding).decode(bytes);

  return { text, encoding };
}
