// SPEC-001-R8: 読み込み前にファイルサイズと空判定を行う（設計 4.2）。
// サイズ上限を超える場合は読み込まず警告。空ファイルは正常扱い（空プレビュー）。

// 5MB = 5,242,880 バイト（SPEC-001 v0.6.0）
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export type ValidationResult =
  | { ok: true; isEmpty: boolean }
  | { ok: false; reason: "too-large" };

/**
 * SPEC-001-R8: ファイルサイズ・空判定を行う。
 * - サイズが上限（5,242,880 バイト）を超える場合は `{ ok: false, reason: 'too-large' }`。
 * - 上限以内なら `{ ok: true, isEmpty }`。`isEmpty` はサイズ 0 のとき true（空プレビュー用）。
 */
export function validateFile(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, reason: "too-large" };
  }
  return { ok: true, isEmpty: file.size === 0 };
}
