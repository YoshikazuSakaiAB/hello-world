// SPEC-001: Manifest V3 の service worker。
// ツールバーアイコンのクリックでプレビュー画面（preview.html）を開く。
// （ファイルの D&D はプレビュー画面側で受ける。MV3 ではアイコンへの D&D は非対応）
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("preview.html") });
});
