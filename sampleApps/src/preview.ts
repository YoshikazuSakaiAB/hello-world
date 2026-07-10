// SPEC-001: プレビュー画面のエントリポイント。
// PreviewPage を組み立てて #app にマウントする（MVP: R1/R2/R5）。
import { createPreviewPage } from "./components/PreviewPage";

const app = document.getElementById("app");
if (app) {
  const page = createPreviewPage();
  app.replaceChildren(page.element);
}
