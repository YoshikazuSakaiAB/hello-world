// markdown-it-task-lists の型定義（@types が存在しないためローカル宣言）。
// SPEC-001-R2: タスクリスト（チェックボックス）対応のためのプラグイン。
declare module "markdown-it-task-lists" {
  import type { PluginWithOptions } from "markdown-it";

  interface TaskListsOptions {
    /** チェックボックスを有効（クリック可能）にするか。既定は false（読み取り専用）。 */
    enabled?: boolean;
    /** 各 <li> をラベルで囲むか。 */
    label?: boolean;
    /** ラベルを <li> の後ろに置くか。 */
    lineNumber?: boolean;
  }

  const taskLists: PluginWithOptions<TaskListsOptions>;
  export default taskLists;
}
