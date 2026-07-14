# Markdown Preview 設計書

- 対象仕様: SPEC-001（`specs/markdownpreview.md`）
- 対象仕様バージョン: 0.7.2
- 設計バージョン: 0.6.2
- ステータス: draft
- 最終更新: 2026-07-14

## 更新履歴
| バージョン | 日付 | 変更種別 | 変更概要 |
|---|---|---|---|
| 0.1.0 | 2026-07-10 | 新規 | SPEC-001 v0.2.0 に基づく初版 |
| 0.2.0 | 2026-07-10 | 改訂 | 対象仕様を 0.3.0 に更新。R3 を拡張内編集→保存(ダウンロード)→再描画方式に設計変更、文字コード対応(R6)の設計を追加 |
| 0.3.0 | 2026-07-10 | 改訂 | 対象仕様を 0.4.0 に更新。保存時の文字コード変更通知(R7)の設計を追加 |
| 0.4.0 | 2026-07-10 | 改訂 | 対象仕様を 0.5.0 に更新。判断ポイントを決着（採用ライブラリ確定、Markdown=CommonMark+GFM、文字コード=UTF-8/Shift-JIS 判定ライブラリ、図=Mermaid のみ）。ファイルサイズ・空ファイル(R8)の設計を追加。技術選定の節を新設 |
| 0.5.0 | 2026-07-10 | 改訂 | 対象仕様を 0.6.0 に更新（レビュー反映）。D&D 受け先をプレビュー画面のドロップ領域に明記、fileSaver の注記表現を仕様に整合、節番号(4.1b→4.2)と 4.8 UI 見出しの仕様No を修正 |
| 0.5.1 | 2026-07-10 | 改訂 | 再レビュー反映（表記のみ）。方針の参照バージョンを v0.6.0 に、fileValidator のサイズ定数コメントを 5,242,880 バイト表記に更新 |
| 0.5.2 | 2026-07-10 | 改訂 | 実装追従（表記のみ）。markdownRenderer(4.4) を実装構成に整合：表・打消し線・コードブロックは markdown-it 本体標準対応、タスクリストは markdown-it-task-lists プラグインで対応、DOMPurify の checkbox 許可設定を明記。技術選定表を分割 |
| 0.6.0 | 2026-07-14 | 改訂 | 対象仕様を 0.7.0 に更新。フロントマターの扱い（R9）を設計。新モジュール frontMatter(4.9) を追加し、js-yaml を技術選定に追加。アーキ図・データフロー・要件対応表・エラー処理表を R9 対応に更新 |
| 0.6.1 | 2026-07-14 | 改訂 | 対象仕様を 0.7.1 に更新（レビュー反映）。R7 通知文言を「{元コード} から {保存コード} に変換して保存しました」形式に確定し、文字コード表示名（UTF-8/Shift-JIS）は fileLoader の encodingLabel で整形する旨を 4.7 に明記 |
| 0.6.2 | 2026-07-14 | 改訂 | 対象仕様を 0.7.2 に更新（レビュー反映）。R2 の裸 URL 自動リンク化（markdown-it の linkify: true）を 4.4 に明記 |

---

## 1. 方針 / 前提
- 形態は Edge ブラウザ拡張機能（Manifest V3 想定）。バックエンドは持たず、クライアント完結（`claude.md` 技術スタック準拠）。
- 言語は TypeScript。UI は HTML/CSS。ドメインロジックとバリデーションは `src/lib/` に、画面は `src/components/` に置く（`claude.md` ディレクトリ構造準拠）。
- 本設計は SPEC-001 の全要件（R1〜R8）を満たすことを目的とし、各節に対応する仕様No を明記する。
- 仕様の判断事項は SPEC-001 v0.6.0 で決着済み。採用ライブラリは「9. 技術選定」に、将来対応は「10. 残課題」にまとめる。

---

## 2. アーキテクチャ全体像

拡張機能を以下のコンポーネントに分割する。Manifest V3 の構成に対応。

```
[ブラウザ拡張]
  ├─ manifest.json         … 拡張機能定義・権限・エントリ登録
  ├─ background (service worker)
  │     … アイコンクリック/起動、プレビュータブの生成、外部連携(R3)の仲介
  ├─ src/components/         … プレビュー画面(UI)
  │     ├─ PreviewPage       … プレビュー表示のトップ(R2/R4)
  │     ├─ FileDropZone      … プレビュー画面のドロップ領域・ダイアログでのファイル受け取り(R1)
  │     ├─ EditorPane        … 本文の編集欄・保存ボタン(R3)
  │     ├─ FrontMatterView   … フロントマターの折りたたみ表示（既定は非表示・展開で表）(R9)
  │     ├─ ErrorBanner       … 対象外ファイル・サイズ超過の通知(R5/R8)
  │     └─ Notice            … 文字コード変更などの情報通知(R7)
  └─ src/lib/                … ドメインロジック(UI非依存・純粋関数優先)
        ├─ fileType          … 拡張子/種別判定(R1/R5)
        ├─ fileValidator     … サイズ上限・空ファイル判定(R8)
        ├─ fileLoader        … File → テキスト読み込み・文字コード判定(R1/R6)
        ├─ frontMatter       … 先頭 YAML フロントマターの分離・解析(R9)
        ├─ markdownRenderer  … Markdown(CommonMark+GFM) → HTML 変換(R2)
        ├─ diagramRenderer   … Mermaid コードブロックの図描画(R4)
        └─ fileSaver         … 編集内容を UTF-8 テキストとして保存/ダウンロード(R3/R7)
```

データフロー（正常系）:
`FileDropZone`(R1) → `fileType` で種別判定(R1/R5) → `fileValidator` でサイズ判定(R8) → OK なら `fileLoader` で文字コードを判定して読み込み(R1/R6) → `frontMatter` で先頭フロントマターを本文と分離(R9) → 本文を `markdownRenderer`(R2)＋`diagramRenderer`(R4) で描画し、フロントマターがあれば `FrontMatterView`(R9) を先頭に配置 → `PreviewPage` に描画。NG なら `ErrorBanner`(R5/R8)。
編集フロー(R3): `EditorPane` で本文を編集 → `markdownRenderer` で再描画 → 保存時は `fileSaver` が UTF-8 でダウンロードし、元の文字コードと異なれば `Notice` で通知(R7)。

---

## 3. 要件 ⇔ 設計 対応表

reviewer が仕様No で追跡できるよう、各要件を担う設計要素を対応づける。

| 仕様No | 要件概要 | 主担当モジュール | 受入れ条件との対応 |
|---|---|---|---|
| SPEC-001-R1 | .md を D&D／ダイアログで指定 | `FileDropZone`, `fileLoader` | R1 正常系（D&D／ダイアログ）|
| SPEC-001-R2 | Markdown(CommonMark+GFM) を解釈しプレビュー | `markdownRenderer`, `PreviewPage` | R2 正常系（記法変換）／準正常系（未解釈行）|
| SPEC-001-R3 | 拡張内で編集・保存・再描画 | `EditorPane`, `fileSaver`, `markdownRenderer` | R3 正常系（編集／再プレビュー／保存）|
| SPEC-001-R4 | Mermaid を図表示 | `diagramRenderer` | R4 正常系／準正常系（不正記法）|
| SPEC-001-R5 | 対象外ファイルを拒否・通知 | `fileType`, `ErrorBanner` | R5 異常系 |
| SPEC-001-R6 | UTF-8/Shift-JIS を文字化けなく表示 | `fileLoader` | R6 正常系（UTF-8／Shift-JIS）|
| SPEC-001-R7 | 文字コード変更時に通知 | `fileSaver`, `EditorPane`, `Notice` | R7 正常系（変わる／変わらない）|
| SPEC-001-R8 | サイズ上限・空ファイルの扱い | `fileValidator`, `ErrorBanner` | R8 異常系（超過）／準正常系（空）|
| SPEC-001-R9 | フロントマターを分離し折りたたみ表示 | `frontMatter`, `FrontMatterView`, `PreviewPage` | R9 正常系（既定非表示／展開で表）／準正常系（無し）|

---

## 4. モジュール設計

### 4.1 fileType（R1 / R5）
- 役割: 入力ファイルが対象（.md）か判定する。
- インターフェース（案）:
  ```ts
  type FileKind = 'markdown' | 'unsupported'
  function detectFileKind(file: File): FileKind
  ```
- 判定基準: 拡張子 `.md` のみ（`.markdown` は対象外。SPEC-001 v0.5.0 で確定）。
- R5: `unsupported` の場合は読み込みを行わず、`ErrorBanner` に「.md ファイルを選択してください」を渡す。

### 4.2 fileValidator（R8）
- 役割: 読み込み前にファイルサイズと空判定を行う。
- インターフェース（案）:
  ```ts
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB = 5,242,880 バイト（SPEC-001 v0.6.0）
  type ValidationResult =
    | { ok: true; isEmpty: boolean }
    | { ok: false; reason: 'too-large' }
  function validateFile(file: File): ValidationResult
  ```
- R8: `too-large` の場合は読み込まず `ErrorBanner` に警告を渡す。空ファイル（`isEmpty`）は正常扱いで、空のプレビューを表示する。

### 4.3 fileLoader（R1 / R6）
- 役割: `File` オブジェクトからテキストを読み込む。**入力ファイルの文字コードは UTF-8 とは限らず、Shift-JIS 等の可能性もある**ため、エンコーディングを判定してからデコードする（R6）。
- 判定した `encoding` は R3 の保存（`fileSaver`）で「元の文字コードを維持」するために保持し、上位（`PreviewPage`/`EditorPane`）へ引き渡す。
- インターフェース（案）:
  ```ts
  type Encoding = 'utf-8' | 'shift_jis' // 対応範囲は 2 種（SPEC-001 v0.5.0）
  interface LoadedFile {
    text: string        // デコード済みテキスト（内部表現は常に UTF-16 文字列）
    encoding: Encoding  // 判定・使用したエンコーディング（保存時に再利用）
  }
  async function readTextFile(file: File): Promise<LoadedFile>
  ```
- 処理手順:
  1. `File` を `ArrayBuffer` として読み込む（テキストとして即 decode しない）。
  2. バイト列から文字コードを判定する（**encoding-japanese** の `detect` を利用。BOM も考慮）。UTF-8 / Shift-JIS 以外や判定不能は **UTF-8 として扱う**（SPEC-001 v0.5.0）。
  3. 判定結果に基づき `TextDecoder(encoding)` でデコードして UTF-16 文字列に統一する。
  4. 以降のモジュール（`markdownRenderer` 等）へは常にデコード済み文字列を渡す。
- 例外時（読み込み失敗）はエラーを返し、UI 側でエラー表示する。

### 4.4 markdownRenderer（R2）
- 役割: Markdown テキスト（デコード済み文字列）を HTML 文字列（またはDOM）に変換する。
- インターフェース（案）:
  ```ts
  function renderMarkdown(source: string): string // 安全化済み HTML
  ```
- 前提: 入力は `fileLoader` でデコード済みの文字列。文字コードの差異はこの層に持ち込まない。
- パーサ: **markdown-it**（CommonMark 準拠）を採用（SPEC-001 v0.5.0）。GFM 相当の表・打消し線・コードブロックは markdown-it 本体で標準対応する。タスクリスト（`- [ ]` / `- [x]`）のみ本体未対応のため **markdown-it-task-lists** プラグイン（読み取り専用 `enabled: false`）を追加する。
- タスクリストの `<input type="checkbox">` は DOMPurify のサニタイズで除去されないよう、許可タグ・属性（`input` / `type` / `checked` / `disabled`）に明示追加する。
- 裸の URL の自動リンク化（GFM 相当）: markdown-it の `linkify: true` により、本文中の裸の URL（`https://…`）を `<a>` に変換する。明示リンク `[text](url)` は linkify 設定に関わらず常に変換される。
- 受入れ条件 R2 正常系: `# 見出し`→`<h1>`、`**太字**`→`<strong>`、`- 箇条書き`→`<ul><li>`。GFM の表・コードブロックも変換する。裸 URL は `<a href="…">` にリンク化される。
- 準正常系: Markdown として解釈できない行はプレーンテキストとしてそのまま出力（markdown-it の既定挙動）。
- セキュリティ: 変換後 HTML は XSS 対策のため **DOMPurify** でサニタイズする。

### 4.5 diagramRenderer（R4, 優先度 could）
- 役割: ` ```mermaid ` コードブロックを **Mermaid**（クライアント JS ライブラリ）で図としてレンダリングする。PlantUML は対象外（SPEC-001 v0.5.0。将来対応）。
- インターフェース（案）:
  ```ts
  async function renderDiagrams(container: HTMLElement): Promise<void>
  ```
- 処理: `markdownRenderer` の出力 HTML 内の mermaid ブロックを走査し、Mermaid で描画する。
- 準正常系（R4）: Mermaid の構文エラー時は該当ブロックのみ失敗とし、他のプレビューは継続表示する（例外を握りつぶし、元テキスト or エラー表示に留める）。

### 4.6 EditorPane（R3, 優先度 should）
- 役割: 本文を編集可能な状態（`<textarea>`）で表示し、編集・再プレビュー・保存を仲介する。
- 背景: ブラウザ拡張のサンドボックスから OS 既定エディタを直接起動する標準APIはないため、**拡張機能内で編集し、保存はダウンロード**する方式を採る（SPEC-001 v0.3.0 で確定）。
- 振る舞い:
  - 編集ボタン押下 → 原文テキストを `<textarea>` に表示（R3 編集）。
  - 編集内容を `markdownRenderer` に再投入してプレビューを更新（R3 再プレビュー。入力時のライブ更新も可）。
  - 保存ボタン押下 → `fileSaver` に「本文＋元 encoding」を渡してダウンロード（R3 保存）。戻り値の `encodingChanged` が true なら `Notice` で保存文字コードを通知（R7）。

### 4.7 fileSaver（R3 / R7, 優先度 should）
- 役割: 編集後テキストをファイルとしてダウンロード保存する。**保存はダウンロード方式（別ファイル）**とし、元ファイルへの直接上書きは対象外。
- 方針（確定）: 保存は **UTF-8 に統一**する（標準 `TextEncoder` が UTF-8 のみのため。SPEC-001 v0.5.0 の決定事項に基づく）。
- インターフェース（案）:
  ```ts
  interface SaveResult {
    savedEncoding: Encoding      // 実際に書き出した文字コード（当面は 'utf-8'）
    encodingChanged: boolean     // 元 encoding と異なる場合 true（R7 判定）
  }
  function saveText(filename: string, text: string, sourceEncoding: Encoding): SaveResult
  ```
- **文字コード変更の判定（R7）**: `sourceEncoding !== savedEncoding` のとき `encodingChanged: true` を返す。呼び出し元（`EditorPane`）はこの結果を見て `Notice` に通知を出す。変わらない場合は通知しない。
- **通知文言（R7・確定）**: 「{元の文字コード} から {保存した文字コード} に変換して保存しました」形式とする（例: 「Shift-JIS から UTF-8 に変換して保存しました」）。文字コード名は `fileLoader` の `encodingLabel()` で表示名（`utf-8`→`UTF-8`、`shift_jis`→`Shift-JIS`）に整形する。
- 実装方針: `Blob`（UTF-8）+ `URL.createObjectURL` + `<a download>` でダウンロードを起動。

### 4.8 UI コンポーネント（R1/R2/R3/R4/R5/R7/R8）
- `PreviewPage`: 変換結果を表示する領域。`FileDropZone`・`EditorPane`・`ErrorBanner`・`Notice` を配置。
- `FileDropZone`（R1/R5）: **プレビュー画面上のドロップ領域**で D&D イベントを受け、ダイアログ（`<input type="file">`）の双方を受ける。Manifest V3 ではツールバーのアイコンへのネイティブ D&D は非対応のため、ドロップ先はプレビュー画面の領域とする（SPEC-001 v0.6.0）。
- `EditorPane`（R3）: 編集ボタン・編集欄・保存ボタン。詳細は 4.6。
- `ErrorBanner`（R5/R8）: 対象外ファイル・サイズ超過のメッセージ表示。プレビュー領域はクリア／未描画のまま。
- `Notice`（R7）: 保存時の文字コード変更などの通知メッセージを表示。エラーではない情報通知。
- `FrontMatterView`（R9）: フロントマターの折りたたみ表示。詳細は 4.10。

### 4.9 frontMatter（R9, 優先度 should）
- 役割: `fileLoader` でデコード済みのテキストから、先頭の YAML フロントマター（`---` で挟まれたブロック）を本文と分離し、メタ情報を key/value に解析する。
- 前提: フロントマターは**ファイル先頭**にあり、`---`（行頭）で開始し、次の `---` または `...`（行頭）で終了する（一般的な YAML フロントマターの規約）。先頭にない `---` は本文の区切り線として扱い、分離しない。
- 複数行のブロック値（例: `style: |`）を正しく解析するため、YAML パーサ **js-yaml** を用いる。
- インターフェース（案）:
  ```ts
  interface FrontMatterEntry {
    key: string
    value: string   // 表示用に文字列化した値（オブジェクト/配列は JSON 文字列などに整形）
  }
  interface ParsedMarkdown {
    entries: FrontMatterEntry[]  // フロントマターが無ければ空配列
    body: string                 // フロントマターを除いた本文（markdownRenderer に渡す）
  }
  function parseFrontMatter(source: string): ParsedMarkdown
  ```
- 処理手順:
  1. 先頭が `---`（行頭）で始まるか判定。始まらなければ `entries: []`, `body: source` を返す（準正常系: フロントマター無し）。
  2. 次の終了区切り（`---` または `...`）までを YAML ブロックとして取り出し、残りを `body` とする。
  3. YAML ブロックを js-yaml でパースし、トップレベルの key/value を `entries` に展開する。値がオブジェクト/配列/複数行文字列の場合は表示用に文字列化する。
  4. YAML として解釈できない場合はフロントマター無しとして扱う（本文全体を `body` にし、エラーにしない）。堅牢性を優先。
- 本文（`body`）は従来どおり `markdownRenderer`(R2) に渡す。フロントマター分離はこの層で完結し、`markdownRenderer` は関与しない。

### 4.10 FrontMatterView（R9, 優先度 should）
- 役割: `parseFrontMatter` の `entries` を、折りたたみ（`<details>`/`<summary>`）内に key/value の表（`<table>`）として描画する。
- 振る舞い:
  - `entries` が空（フロントマター無し）の場合は**何も描画しない**（準正常系: 折りたたみ自体を出さない）。
  - `entries` があれば `<details>`（既定は閉じ＝非表示）を生成し、`<summary>` に「フロントマター」等のラベル、内部に key/value の `<table>` を置く（R9 正常系: 既定非表示／展開で表）。
- 配置: `PreviewPage` が本文プレビューの**先頭**に `FrontMatterView` を差し込む。

---

## 5. データ設計
- 本機能はファイル内容を永続化しない（プレビュー用途）。
- 設定（テーマ、対応記法の切替など）が必要になった場合のみ `chrome.storage`（フォールバックで `localStorage`）に保存する。キー設計は設定項目が確定してから定義する。

---

## 6. エラー処理
| ケース | 対応 | 対応仕様No |
|---|---|---|
| .md 以外のファイル | 「.md ファイルを選択してください」を表示、プレビューしない | R5 |
| サイズ上限（5MB）超過 | 警告を表示、プレビューしない | R8 |
| 空ファイル | 空のプレビューを表示、エラーにしない | R8 |
| ファイル読み込み失敗 | エラーメッセージを表示 | R1 |
| 文字コード判定不能 | UTF-8 として扱ってデコード | R6 |
| Markdown 未解釈行 | プレーンテキストとして表示、エラーにしない | R2 |
| Mermaid 構文エラー（R4） | 該当ブロックのみ失敗扱い、他のプレビューは継続 | R4 |
| 保存時に文字コードが変わる（例: Shift-JIS→UTF-8） | エラーではなく `Notice` で保存文字コードを通知 | R7 |
| フロントマターが YAML として解釈できない | フロントマター無しとして扱い本文全体を表示、エラーにしない | R9 |

---

## 7. テスト方針（`__tests__/` 対応）
- `src/lib/` の純粋関数（`detectFileKind`, `renderMarkdown` 等）を `__tests__/lib/` で単体テスト。受入れ条件の Given/When/Then をそのままテストケースに落とす。
- `fileLoader` は UTF-8 と Shift-JIS の両方のバイト列を入力に、正しくデコードされ `encoding` が保持されることをテストする（R6・文字化けの回帰防止）。
- `fileSaver` は本文＋encoding を渡したとき、意図した内容・文字コードの Blob が生成されること、および元と異なる場合に `encodingChanged: true` を返すことをテストする（R3/R7）。
- `fileValidator` はサイズ超過・空ファイルの判定結果をテストする（R8）。
- `diagramRenderer` は正常な Mermaid が描画され、構文エラー時に他のプレビューが継続することをテストする（R4）。
- `frontMatter` は「先頭フロントマターを分離して body と entries に分ける」「複数行ブロック値（`style: |`）を解析できる」「フロントマター無し・不正 YAML では body 全体を返す」ことをテストする（R9）。
- `src/components/` は `__tests__/components/` で D&D・ダイアログ・エラー表示・通知・フロントマター折りたたみ（既定非表示／展開で表）の振る舞いをテスト。
- 各テストに対応する仕様No をコメントで紐づける（`claude.md` のコメント規約準拠）。

---

## 8. 技術選定（採用ライブラリ）
SPEC-001 v0.5.0 の決定に基づき確定。バージョンは実装時に最新安定版を選ぶ。

| 用途 | 採用 | 対応仕様No | 備考 |
|---|---|---|---|
| Markdown → HTML | markdown-it | R2 | CommonMark 準拠。表・打消し線・コードブロックは本体標準対応 |
| タスクリスト | markdown-it-task-lists | R2 | `- [ ]` / `- [x]` をチェックボックス化（読み取り専用）|
| HTML サニタイズ | DOMPurify | R2 | XSS 対策 |
| 文字コード判定 | encoding-japanese | R6 | UTF-8/Shift-JIS を判定。不能時 UTF-8 |
| フロントマター解析 | js-yaml | R9 | 先頭 YAML を key/value に解析。複数行ブロック値に対応 |
| 図の描画 | Mermaid | R4 | クライアント描画のみ |
| 言語/ビルド | TypeScript（＋バンドラ） | 全体 | Manifest V3・拡張機能としてパッケージ |

---

## 9. 残課題 / 将来対応
仕様書「8. 残課題 / 将来対応」に対応。今回のスコープ外。

- PlantUML の図表示（外部サーバ利用時のプライバシー方針とあわせて検討）
- 対応文字コードの拡張（EUC-JP・UTF-16 等）
- 元ファイルへの上書き保存（File System Access API の制約を踏まえた検討）
- ファイルサイズ上限（5MB）の妥当性・可変化
