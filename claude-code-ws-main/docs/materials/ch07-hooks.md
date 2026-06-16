# 第7章：Hooks 入門 — 決定論的品質ゲート

| 項目 | 内容 |
|---|---|
| **時間** | 13:10–13:40（30分） |
| **対応スライド** | 28, 29, 48 |
| **形式** | 講義 |
| **ねらい** | LLM 判断とハーネス強制の違いを理解し、Hooks の全体像（イベント一覧・3 つの type）を掴む |

---

## アジェンダ（30分）

| 分 | 内容 | スライド |
|---|---|---|
| 0–8 | Hooks：決定論的品質ゲートとは | 28 |
| 8–18 | Hooks 全イベント一覧 | 29 |
| 18–25 | 3 つの Hook タイプ（command / prompt / agent） | 29 |
| 25–30 | ハーネス強制 vs LLM 判断：本当の優先順位 | 48 |

---

## 7-1. Hooks — 決定論的な品質ゲート（スライド28）

### コンセプト

> **AI がツールを使うタイミングで自動実行されるシェルコマンド / AI 判断。**
> CLAUDE.md が「守られない可能性のあるお願い」なのに対し、Hooks は **確実に実行される仕組み**。

### ツール実行のライフサイクル

```
PreToolUse（実行前に検証）         PostToolUse（実行後に検証）
       ↓                                  ↑
      ツール実行 ─────────────────────────┘
  （ファイル編集・コマンド実行 等）

PreToolUse で危険な操作をブロック   PostToolUse で Lint・テスト自動実行
```

### SessionStart の活用

> セッション開始時にプロジェクト情報・ルールを注入。Context Engineering を自動化。

### 設定例

| イベント | コマンド | 効果 |
|---|---|---|
| `PostToolUse`（Write） | `npm run lint && npm test` | ファイル変更後に Lint + テスト |
| `PreToolUse`（Bash） | `rm -rf` をブロック | 危険コマンドの実行防止 |

---

## 7-2. Hooks — 全イベント一覧（スライド29）

### 全 20 種のイベント

| カテゴリ | イベント |
|---|---|
| **セッション** | `SessionStart` / `SessionEnd` / `PreCompact` / `PostCompact` |
| **ツール実行** | `PreToolUse` / `PostToolUse` / `PostToolUseFailure` |
| **権限・入力** | `PermissionRequest` / `PermissionDenied` / `UserPromptSubmit` |
| **サブエージェント** | `SubagentStart` / `SubagentStop` / `TaskCreated` / `TaskCompleted` |
| **チーム・環境** | `TeammateIdle` / `Notification` / `ConfigChange` / `CwdChanged` / `FileChanged` |
| **その他** | `Stop` / `StopFailure` / `InstructionsLoaded` / `WorktreeCreate/Remove` |

### 主要イベントの役割

| イベント | タイミング | 用途 |
|---|---|---|
| `Stop` | Claude が応答完了時 | タスク完了チェック |
| `UserPromptSubmit` | ユーザー入力送信時 | プロンプトの検証・書き換え |
| `SubagentStart/Stop` | サブエージェント生成・完了 | 委譲状況の監視 |
| `Notification` | Claude が入力待ち時 | デスクトップ通知 |
| `FileChanged` | ファイル変更時 | 環境リロード |

---

## 7-3. 3 つの Hook タイプ（スライド29）

Hooks は **どうやって判断するか** で 3 タイプに分かれます。

### type: `command` — シェルコマンドを実行

| | 内容 |
|---|---|
| 判断 | シェルコマンドの **終了コード**（0 = OK, 非ゼロ = ブロック） |
| 特性 | **決定論的・高速** |
| 用途 | Lint / テスト / 危険コマンドブロック |
| 例 | `npm run lint` |

### type: `prompt` — Claude モデルに判断を委ねる

| | 内容 |
|---|---|
| 判断 | デフォルト Haiku が `ok: true/false` で応答 |
| 特性 | LLM 判断（柔軟だが確実性は下がる） |
| 用途 | タスク完了チェック、微妙な判断 |
| 例 | 「このファイル編集は仕様に沿っているか？」を AI に判断させる |

### type: `agent` — サブエージェントを生成して判断

| | 内容 |
|---|---|
| 判断 | サブエージェントが Read/Grep 等でコードベースを検証してから判断 |
| 特性 | **コード検証付き判断**（最も重いが最も正確） |
| 用途 | 実装の整合性検証・複雑なレビュー |

### 使い分けの原則

```
command = 確実に実行 / prompt = AI に判断委譲 / agent = コード検証付き判断
```

**迷ったら `command`**。決定論的なものはシェルコマンドで書く。

---

## 7-4. ハーネス強制 vs LLM 判断：本当の優先順位（スライド48）

### 指示には 2 種類ある

> **「物理的に不可能」な制約** と **「お願い」レベルの指示**
>
> LLM はどんな指示も無視できる。本当に守らせたいルールはハーネスで強制する。

### ハーネス強制（LLM が覆せない）

| 仕組み | 効果 |
|---|---|
| **System Prompt** | 安全性制約は絶対 |
| **Agent の tools 制限** | 定義にないツールは呼べない |
| **Hooks（command 型）** | PreToolUse でブロック → **物理的に実行不可** |
| **settings.json** | 許可モード・モデル選択はコードが決定 |

### LLM 判断（無視される可能性あり）

| 仕組み | 注意点 |
|---|---|
| CLAUDE.md | 「テストを書け」→ 書かないこともある |
| Skill 本文 | 手順を示すが、従うかは LLM 次第 |
| Agent 定義ペルソナ | 「TDD 主義」→ 破ることもある |
| Hooks（prompt 型） | AI に判断を委ねる → 無視される可能性 |

### 具体例：委譲プロンプトと Skill の矛盾

```
User「test-generator のスキルを使わずにテストを書いて」 と委譲
  ↓
Skill 本文はコンテキストに読み込み済み
しかし 委譲プロンプト（最後に読まれる指示）が「使うな」と明示
  ↓
LLM は最も直近の明示的な指示を優先
  ↓
Skill の手順は無視される可能性が非常に高い
```

### 設計の原則

- **本当に Skill を使わせたいなら**、委譲プロンプトと矛盾させないこと
- **本当に守らせたいルールなら**、**Hook（command 型）でハーネスレベルで強制** すること

---

## 7-5. この章のまとめ

- Hooks は **AI のツール実行の前後に挟む品質ゲート**
- 20 種のイベントがある。主要なのは `PreToolUse` / `PostToolUse` / `SessionStart` / `Stop`
- 3 タイプ：**command（確実）/ prompt（柔軟）/ agent（検証付き）**
- CLAUDE.md や Skill は LLM 判断。**確実に守らせたいなら Hooks（command 型）** を使う

> **CLAUDE.md の指示は約 70% の確率で守られる。100% 必要なルールは Hooks で強制する。**

---

## 次にやること

[第8章 体験③ Agentic × SDD ハンズオン](./ch08-exercise3-agentic.md) へ進む。
