// Vitest 共通セットアップ。
// jsdom 環境で不足するブラウザ API のスタブが必要になった場合はここに追加する。

// jsdom は Blob/File.prototype.text() を実装していないため、テスト用にポリフィルする。
// （本番のブラウザでは標準実装。PreviewPage が file.text() を利用する）
if (typeof Blob !== "undefined" && typeof Blob.prototype.text !== "function") {
  Blob.prototype.text = function (this: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(this);
    });
  };
}

export {};
