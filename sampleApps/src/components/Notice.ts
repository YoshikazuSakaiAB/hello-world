// SPEC-001-R7: 情報通知（エラーではない）を表示する。
// 保存時の文字コード変更などを知らせる（設計 4.8 Notice）。

export interface Notice {
  /** 通知のルート要素 */
  readonly element: HTMLElement;
  /** メッセージを表示する */
  show(message: string): void;
  /** メッセージを消す（非表示にする） */
  clear(): void;
}

/**
 * SPEC-001-R7: 情報通知バナーを生成する。
 * 初期状態は非表示。`show` で表示、`clear` で非表示に戻す。
 */
export function createNotice(): Notice {
  const element = document.createElement("div");
  element.className = "notice";
  element.setAttribute("role", "status");
  element.hidden = true;

  return {
    element,
    show(message: string): void {
      element.textContent = message;
      element.hidden = false;
    },
    clear(): void {
      element.textContent = "";
      element.hidden = true;
    },
  };
}
