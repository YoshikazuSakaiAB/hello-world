// SPEC-001-R5 / R8: 対象外ファイル・サイズ超過などのエラーメッセージを表示する。
// エラー時はプレビュー領域をクリア／未描画のままとする（設計 4.8 ErrorBanner）。

export interface ErrorBanner {
  /** バナーのルート要素 */
  readonly element: HTMLElement;
  /** メッセージを表示する */
  show(message: string): void;
  /** メッセージを消す（非表示にする） */
  clear(): void;
}

/**
 * SPEC-001-R5/R8: エラーバナーを生成する。
 * 初期状態は非表示。`show` でメッセージ表示、`clear` で非表示に戻す。
 */
export function createErrorBanner(): ErrorBanner {
  const element = document.createElement("div");
  element.className = "error-banner";
  element.setAttribute("role", "alert");
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
