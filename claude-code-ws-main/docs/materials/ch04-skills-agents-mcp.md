# 第4章：ハーネス構成要素① — Skills / Agents / MCP

| 項目 | 内容 |
|---|---|
| **時間** | 15:10–15:55（45分） |
| **対応スライド** | 17–22, 47 |
| **形式** | 講義 |
| **ねらい** | SKILL.md の 2 部構成 / Skills vs Agents の使い分け / MCP の位置付けを言語化できる |

---

## アジェンダ（45分）

| 分 | 内容 | スライド |
|---|---|---|
| 0–8 | Skills：タスク特化の知識パック（概念） | 17 |
| 8–18 | SKILL.md の書き方（2部構成） | 18 |
| 18–25 | Skills — YAML Front Matter と確実な呼び出し | 19 |
| 25–35 | Agents 定義 — 専門ロールのサブエージェント | 20 |
| 35–42 | Agents のコンテキスト管理と活用パターン | 21, 47 |
| 42–45 | MCP — 外部サービス連携 | 22 |

---

## 4-1. Skills — タスク特化の知識パック（スライド17）

### AI が自動で Skill を判断するしくみ

```
「PDF作って」
    ↓
AI が必要な Skill を自動判断
    ↓
SKILL.md を読込
```

人間が指定しなくても、**タスク内容から最適な Skill を選んで読み込む**。
`description` の記述が判断の鍵。

### 段階的読込でコンテキストを節約

```
Step 1: description だけ読み込む      ← コンテキスト消費：小
          ↓（必要と判断したら）
Step 2: SKILL.md 本体を読み込む
          ↓（手順に沿って）
Step 3: scripts / templates を実行
```

### CLAUDE.md vs Skills

| | 読込方式 | コスト |
|---|---|---|
| CLAUDE.md | **常時全文読込** | 毎ターン固定コスト |
| Skills | **段階的に必要な分だけ** | 呼出し時のみ |

---

## 4-2. SKILL.md の書き方（スライド18）

### 2 部構成

```yaml
---
# YAML Front Matter
name: explain-code
description: >
  コードを図と例え話で説明する。
  "how does this work?" と聞かれた時。
---

# Markdown 本文
コードを説明する時は必ず：
1. 日常の例えで比喩する
2. ASCII 図で構造を描く
3. ステップごとに解説
4. よくある落とし穴を警告

難しい概念は複数の比喩を使う。
```

### ディレクトリ構造

```
my-skill/
  SKILL.md           ← 必須（エントリポイント）
  scripts/           ← 補助スクリプト
    validate.sh
  references/        ← 参照ドキュメント
    schema.md
  assets/            ← テンプレート等
```

### 配置場所

| パス | スコープ |
|---|---|
| `~/.claude/skills/` | 個人用（全プロジェクト共通） |
| `.claude/skills/` | プロジェクト用（Git で共有） |
| plugin の `skills/` | プラグイン経由で配布 |

---

## 4-3. YAML Front Matter と確実な呼び出し（スライド19）

### YAML Front Matter のプロパティ

| プロパティ | 役割 |
|---|---|
| `name` | Skill 名（省略時はディレクトリ名） |
| **`description`** | **必須**。AI が使うか判断する材料 |
| `allowed-tools` | 許可確認なしで使えるツール |
| `disable-model-invocation` | AI 自動呼出しを無効化 |
| `model` | 使用モデルの指定 |
| `context` | fork 等のコンテキスト制御 |

### 確実に呼び出されるための 4 原則

1. **`description` が最重要**
   AI はこの文だけで「使うべきか」を判断。
   **What + When + Capabilities** の 3 要素を必ず含める。

2. **トリガーワードを列挙する**
   「.docx を作成する時」「Word 文書」「レポート生成」など、
   ユーザーが使いそうな表現を網羅的に記載。

3. **NOT条件も書く**
   「PDF には使わない」「スプレッドシートは対象外」で誤発火を防止。

4. **三人称で書く（公式推奨）**
   `This skill should be used when...` と書く。
   一人称・二人称は発見精度を下げる。

### 良い例

```yaml
description: >
  This skill should be used when the user asks to create
  a .docx / Word document (e.g. "make a Word doc", "レポート作成").
  NOT for PDF or spreadsheets.
```

---

## 4-4. Agents 定義 — 専門ロールのサブエージェント（スライド20）

### Skills と Agents の違い

| | Skills | Agents（サブエージェント） |
|---|---|---|
| コンテキスト | メイン会話に**注入**（インライン実行） | **独立したコンテキストウィンドウ**で実行（フォーク） |
| 実行結果 | メインの文脈に残る | **要約だけ返す**（メインを汚さない） |
| ツール | メインと同じ | 制限可能（Read only 等） |
| モデル | メインと同じ | 別モデル指定可能（Haiku でコスト削減） |
| 用途 | **手順書・知識の注入** | **タスクの委譲・並行処理** |

### 主要な Front Matter プロパティ

| プロパティ | 役割 |
|---|---|
| `name` / `description` | 必須。AI が委譲先を判断する材料 |
| `tools` / `disallowedTools` | 使えるツールを制限（Read only 等） |
| `model` | `haiku` / `sonnet` / `opus` / `inherit` |
| `permissionMode` | `acceptEdits` / `auto` / `bypassPermissions` 等 |
| `maxTurns` / `skills` / `hooks` | ターン制限、Skills 事前読込、専用 Hooks |

---

## 4-5. Agents のコンテキスト管理と活用パターン（スライド21, 47）

### コンテキスト分離のしくみ

```
メインの                   委譲          サブエージェント
コンテキスト         ────────────→     のコンテキスト
  あなたの会話                              専用システムプロンプト
  仕様・指示・履歴                          独自ツール・モデル
                        ←─ 要約だけ返す
```

### メリット

- **メインの文脈を汚さない**（探索結果やログは破棄される）
- **コスト削減**（Haiku 活用）
- **並行実行が可能**

### 補足：サブエージェントに渡されるコンテキスト（スライド47）

```
メインエージェント
├─ System Prompt（内蔵）
├─ CLAUDE.md（全スコープ）
├─── キャッシュ境界 ───
├─ 会話履歴
│   User:「LoginForm のテスト作って」
└─ AgentTool({ subagent_type: "test-agent", ... })

  ↓ 委譲

testAgent（サブエージェント）
├─ System Prompt（親と同一→キャッシュ、課金なし）
├─ CLAUDE.md（親と同一→キャッシュ、課金なし）
├─ Agent 定義（test-agent.md）← 新規
├─ Skill 本文（呼ばれた時）     ← 新規
└─ 委譲プロンプト               ← 新規

  ↓ 完了
出力の要約だけを親に返す（作業コンテキストは返さない）
```

> **fork 型**：親コンテキストをバイト同一コピー → キャッシュヒット → 5 体フォークしても 1 体とほぼ同コスト。

### 組込みエージェントとカスタム例

| エージェント | 設定 | 用途 |
|---|---|---|
| **組込み** | | |
| Explore | Haiku / Read-only | コードベース探索 |
| Plan | Inherit / Read-only | プラン策定用リサーチ |
| General | Inherit / 全ツール | 汎用タスク実行 |
| **カスタム例** | | |
| reviewer | Read-only / Sonnet | コードレビュー |
| tester | Bash / Sonnet | テスト実行・検証 |
| debugger | 全ツール / Sonnet | エラー分析・修正 |

> **Skills = 知識を注入 / Agents = タスクを委譲。** メインの文脈を守りながら専門家に任せる。

---

## 4-6. MCP — AI の行動範囲を拡張するプラグイン（スライド22）

### Model Context Protocol とは

AI エージェントと外部サービスを接続する **標準プロトコル**。
USB のように「繋げば使える」統一規格。

```
Claude Code ──→ MCP Server ──→ GitHub / Slack / Notion / DB / Jira / Google Drive
```

### 活用パターン（3つ）

| パターン | 内容 |
|---|---|
| **Issue → PR 自動化** | GitHub MCP で Issue を読み、仕様化→実装→PR 作成まで自律実行 |
| **会話 → コード** | Slack MCP でチャンネルの要件議論を参照し、仕様に反映して実装 |
| **DB → マイグレーション** | DB MCP でスキーマを読み取り、変更のマイグレーションを自動生成 |

> 公式・コミュニティの MCP サーバーが多数公開。**自作せず既存を活用するのが基本**。

---

## 4-7. この章のまとめ

- **Skills** = 知識をオンデマンドで注入。`description` が発火条件を決める
- **Agents** = タスクをサブエージェントに委譲。独立コンテキストでメインを汚さない
- **MCP** = 外部サービスへの統一接続規格。公式・コミュニティの既存を使う
- 使い分け：**手順書は Skills、重い並行タスクは Agents、外部連携は MCP**

---

## 次にやること

[☕ 10分休憩] → [第5章 体験② SDD ハンズオン](./ch05-exercise2-sdd.md) へ進む。
