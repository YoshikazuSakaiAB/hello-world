import { describe, it, expect } from "vitest";
import { convert } from "encoding-japanese";
import { detectEncoding, encodingLabel, readTextFile } from "../../src/lib/fileLoader";

// UNICODE 文字列を Shift-JIS のバイト列に変換するヘルパー
function toShiftJis(text: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(
    convert(text, { to: "SJIS", from: "UNICODE", type: "array" }),
  );
}

// バイト列から File を作るヘルパー
function fileFromBytes(name: string, bytes: Uint8Array<ArrayBuffer>): File {
  return new File([bytes], name, { type: "text/markdown" });
}

describe("detectEncoding (SPEC-001-R6)", () => {
  it("detects UTF-8 bytes as utf-8", () => {
    const bytes = new TextEncoder().encode("日本語テスト");
    expect(detectEncoding(bytes)).toBe("utf-8");
  });

  it("detects Shift-JIS bytes as shift_jis", () => {
    expect(detectEncoding(toShiftJis("日本語テスト"))).toBe("shift_jis");
  });

  // 判定不能・ASCII のみなどは UTF-8 として扱う
  it("falls back to utf-8 for ascii/undetectable bytes", () => {
    const bytes = new TextEncoder().encode("plain ascii text");
    expect(detectEncoding(bytes)).toBe("utf-8");
  });
});

describe("encodingLabel (SPEC-001-R7)", () => {
  // 通知メッセージ用の表示名（小文字コード名ではなく整形名）
  it("returns display names for encodings", () => {
    expect(encodingLabel("utf-8")).toBe("UTF-8");
    expect(encodingLabel("shift_jis")).toBe("Shift-JIS");
  });
});

describe("readTextFile (SPEC-001-R1/R6)", () => {
  // SPEC-001-R6 正常系: UTF-8 の日本語が文字化けなく読める
  it("reads UTF-8 Japanese without garbling", async () => {
    const bytes = new TextEncoder().encode("# 見出し\n日本語");
    const loaded = await readTextFile(fileFromBytes("utf8.md", bytes));
    expect(loaded.encoding).toBe("utf-8");
    expect(loaded.text).toBe("# 見出し\n日本語");
  });

  // SPEC-001-R6 正常系: Shift-JIS の日本語が文字化けなく読める
  it("reads Shift-JIS Japanese without garbling", async () => {
    const loaded = await readTextFile(
      fileFromBytes("sjis.md", toShiftJis("# 見出し\n日本語")),
    );
    expect(loaded.encoding).toBe("shift_jis");
    expect(loaded.text).toBe("# 見出し\n日本語");
  });

  // 空ファイルはエラーにならず空文字列（encoding は utf-8 扱い）
  it("reads an empty file as empty text", async () => {
    const loaded = await readTextFile(fileFromBytes("empty.md", new Uint8Array()));
    expect(loaded.text).toBe("");
    expect(loaded.encoding).toBe("utf-8");
  });
});
