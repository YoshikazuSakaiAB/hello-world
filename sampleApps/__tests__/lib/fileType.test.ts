import { describe, it, expect } from "vitest";
import { detectFileKind } from "../../src/lib/fileType";

// テスト用の File を生成するヘルパー（中身は判定に無関係）
function makeFile(name: string): File {
  return new File(["dummy"], name, { type: "text/plain" });
}

describe("detectFileKind (SPEC-001-R1/R5)", () => {
  // SPEC-001-R1: .md は markdown として受け付ける
  it("returns 'markdown' for a .md file", () => {
    expect(detectFileKind(makeFile("note.md"))).toBe("markdown");
  });

  // 拡張子の大文字small無視（.MD も markdown）
  it("is case-insensitive for the extension", () => {
    expect(detectFileKind(makeFile("README.MD"))).toBe("markdown");
  });

  // SPEC-001 v0.6.0: .markdown は対象外
  it("returns 'unsupported' for a .markdown file", () => {
    expect(detectFileKind(makeFile("note.markdown"))).toBe("unsupported");
  });

  // SPEC-001-R5: .md 以外は unsupported
  it("returns 'unsupported' for non-md files", () => {
    expect(detectFileKind(makeFile("note.txt"))).toBe("unsupported");
    expect(detectFileKind(makeFile("image.png"))).toBe("unsupported");
  });

  // 拡張子なしは unsupported
  it("returns 'unsupported' for a file without extension", () => {
    expect(detectFileKind(makeFile("README"))).toBe("unsupported");
  });

  // ドットを含む名前でも最後の拡張子で判定する
  it("judges by the last extension", () => {
    expect(detectFileKind(makeFile("my.notes.md"))).toBe("markdown");
    expect(detectFileKind(makeFile("archive.md.zip"))).toBe("unsupported");
  });

  // 先頭ドットの隠しファイル（拡張子なし扱い）は unsupported
  it("treats dotfiles without extension as unsupported", () => {
    expect(detectFileKind(makeFile(".gitignore"))).toBe("unsupported");
  });
});
