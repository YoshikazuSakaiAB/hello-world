import { describe, it, expect, vi } from "vitest";
import { createFileDropZone } from "../../src/components/FileDropZone";

function makeFile(name: string): File {
  return new File(["dummy"], name, { type: "text/markdown" });
}

describe("createFileDropZone (SPEC-001-R1)", () => {
  // SPEC-001-R1 正常系: D&D でファイルを受け取り onFile に渡す
  it("calls onFile with the dropped file", () => {
    const onFile = vi.fn();
    const zone = createFileDropZone(onFile);
    const file = makeFile("note.md");

    const event = new Event("drop", { bubbles: true, cancelable: true });
    // jsdom には DataTransfer が無いため最小限のスタブを与える
    Object.defineProperty(event, "dataTransfer", {
      value: { files: [file] },
    });
    zone.element.dispatchEvent(event);

    expect(onFile).toHaveBeenCalledTimes(1);
    expect(onFile).toHaveBeenCalledWith(file);
  });

  it("prevents default browser open on dragover", () => {
    const zone = createFileDropZone(vi.fn());
    const event = new Event("dragover", { bubbles: true, cancelable: true });
    zone.element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  // ファイルがドロップされなかった場合は onFile を呼ばない
  it("does not call onFile when no file is present", () => {
    const onFile = vi.fn();
    const zone = createFileDropZone(onFile);
    const event = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", { value: { files: [] } });
    zone.element.dispatchEvent(event);
    expect(onFile).not.toHaveBeenCalled();
  });
});
