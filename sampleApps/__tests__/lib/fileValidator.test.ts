import { describe, it, expect } from "vitest";
import { validateFile, MAX_FILE_SIZE } from "../../src/lib/fileValidator";

// 指定サイズの File を作るヘルパー（中身は判定に無関係、size のみ意味を持つ）
function makeFileOfSize(size: number): File {
  return new File([new Uint8Array(size)], "note.md", { type: "text/markdown" });
}

describe("validateFile (SPEC-001-R8)", () => {
  // 上限は 5MB = 5,242,880 バイト
  it("defines the limit as 5,242,880 bytes", () => {
    expect(MAX_FILE_SIZE).toBe(5_242_880);
  });

  // SPEC-001-R8 異常系: 上限を超えると too-large
  it("rejects a file larger than the limit", () => {
    const result = validateFile(makeFileOfSize(MAX_FILE_SIZE + 1));
    expect(result).toEqual({ ok: false, reason: "too-large" });
  });

  // 上限ちょうどは許容する（超える場合のみ拒否）
  it("accepts a file exactly at the limit", () => {
    const result = validateFile(makeFileOfSize(MAX_FILE_SIZE));
    expect(result).toEqual({ ok: true, isEmpty: false });
  });

  // 通常サイズは ok, 空でない
  it("accepts a normal file as non-empty", () => {
    const result = validateFile(makeFileOfSize(100));
    expect(result).toEqual({ ok: true, isEmpty: false });
  });

  // SPEC-001-R8 準正常系: 空ファイルは ok かつ isEmpty
  it("accepts an empty file as isEmpty", () => {
    const result = validateFile(makeFileOfSize(0));
    expect(result).toEqual({ ok: true, isEmpty: true });
  });
});
