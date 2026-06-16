# 第8章：体験③ Agentic × SDD ハンズオン

| 項目 | 内容 |
|---|---|
| **時間** | 13:40–14:50（70分） |
| **対応スライド** | 25–27, 30, 31, 36 |
| **形式** | ハンズオン（個人演習 / 質問は自由） |
| **ねらい** | Hooks + Agents 定義 + サブエージェント委譲（Hub-and-Spoke）を自分で組む |
| **演習ディレクトリ** | [`exercise-3-agentic/`](../../exercise-3-agentic/) |

> **注**: 旧版は 60 分でしたが、アンケート反映で Agents 定義の時間を厚くするため **70 分に拡張** しました。

---

## アジェンダ（70分）

| 分 | 内容 | スライド |
|---|---|---|
| 0–5 | Agentic × SDD の全体像 | 26, 27 |
| 5–10 | 体験③ の 3 ステップ概要 | 30 |
| 10–25 | Step 1: Hooks 設定（15分） | 31 |
| 25–50 | Step 2: Agents 定義を作る（25分） | 31 |
| 50–65 | Step 3: サブエージェントに委譲（15分） | 31, 36 |
| 65–70 | Step 4: 振り返り（5分） | — |

---

## 8-1. Agentic × SDD の全体像（スライド26, 27）

### AI が自律的に回すサイクル

```
👤「〇〇の機能を実装して」
    ↓
🤖 AI が自律で実行
    ├─ ① 仕様書を自動生成         受入条件・ユーザーストーリー
    ├─ ② タスクリストを分割       バックログ自動生成
    ├─ ③ テストを先に書く         TDD：Red を先に作る
    └─ ④ 実装 & 自動検証          Green になるまでループ
    ↓
👤 人間はレビュー & 承認だけ
```

### Agentic の中核：SDD + TDD

```
1. Define        2. Plan         3. Implement       4. Verify
   仕様を書く       タスク分割       1つずつ実装          仕様で検証
   受入条件・       AI がバックログ  Claude とペアプロ    Red→Green
   ユーザー         を自動生成       仕様がガードレール   テスト≠書き換え
   ストーリー
```

> **TDD:「テストを先に書く」＝ SDD:「仕様を先に書く」**

---

## 8-2. 体験③ の 3 ステップ概要（スライド30）

```
1. ① Hooks を設定                 → PostToolUse で Lint / テスト自動実行
2. ② Agents 定義を作成            → .claude/agents/ にレビュワー・テスター等
3. ③ サブエージェントに委譲       → メインから専門ロールにタスクを委譲（Hub-and-Spoke）
```

### 体験② と体験③ の違い

```
体験②（Context Eng.）              体験③（Harness Eng.）
-----------------------            -----------------------
人間が指示                          人間が指示
  → AI が1つずつ実装                  → Hooks が品質ゲート自動実行
  → 人間が確認                        → サブエージェントが並行作業
```

---

## 8-3. Step 1: Hooks 設定（15分）

### 目的

体験② で作った日報アプリに、**自動品質ゲート** を組み込む。

### 手順

1. 体験② の成果物を体験③ ディレクトリにコピー
   ```
   cp -r exercise-2-sdd/{src,__tests__,specs,package.json,CLAUDE.md} exercise-3-agentic/
   ```

2. `.claude/settings.json` を開く（または作成）

3. `hooks` セクションに `PostToolUse` を追加

   ```json
   {
     "hooks": {
       "PostToolUse": [
         {
           "matcher": "Write|Edit",
           "hooks": [
             {
               "type": "command",
               "command": "npx tsc --noEmit && npm test -- --run"
             }
           ]
         }
       ]
     }
   }
   ```

4. 動作確認：AI に何かファイルを編集させ、Hooks が走るか確認

### 講師のフォローポイント

- `matcher` でツール名を正規表現指定（`Write|Edit` = Write か Edit）
- コマンドが **非ゼロ終了コード** で終わると **次のツールがブロック** される
- Hooks の出力は Claude のコンテキストに戻る（エラーメッセージを AI が見て修正する）

---

## 8-4. Step 2: Agents 定義を作る（25分）

### 目的

**専門ロール** をサブエージェントとして定義し、メインエージェントから **委譲** できるようにする。

### ディレクトリ構造

```
.claude/
  └─ agents/
      ├─ reviewer.md    ← コードレビュー担当（Read-only）
      └─ tester.md      ← テスト実行担当（Bash + Read）
```

### reviewer.md の雛形

```markdown
---
name: reviewer
description: >
  Use this agent to review implementation against the spec.
  Read-only. Returns a structured review with ✅/❌ per acceptance criterion.
tools: Read, Grep, Glob
model: sonnet
permissionMode: acceptEdits
---

# Code Reviewer

You are a code reviewer. For each acceptance criterion in `specs/daily-report.md`:

1. Read the spec
2. Read the implementation in `src/`
3. Check: does the implementation satisfy the criterion?
4. Return a table with columns: `#` | `criterion` | `✅/❌` | `evidence`

Do NOT edit any files. Only read and report.
```

### tester.md の雛形

```markdown
---
name: tester
description: >
  Use this agent to run Vitest and return pass/fail counts + failing test names.
tools: Bash, Read
model: sonnet
permissionMode: acceptEdits
---

# Tester

You run `npm test -- --run` and report:

- total tests
- passed / failed counts
- list of failing test names with the first line of the error

Do NOT fix any tests. Only run and report.
```

### 講師のフォローポイント

- `description` は **三人称・When を含める**（Day1 第4章の原則）
- `tools` を絞ることで **物理的に編集不可** にできる（ハーネス強制の実例）
- `model` を `sonnet` にすればコスト最適化（単純タスクは `haiku` でも可）

---

## 8-5. Step 3: サブエージェントに委譲して新機能追加（15分）

### Hub-and-Spoke パターン（スライド36）

```
         メイン
       （オーケストレータ）
       ／    ｜    ＼
   委譲   委譲   委譲
    ↓     ↓     ↓
 探索   計画   実装   テスト
```

> 同時に委譲、報告は親のみ。独立タスクを同時に処理したい時に有効。

### プロンプト例（新機能追加）

```
spec に「ダークモード切替」を追加して、以下の順で進めてください：

1. 仕様セクションを specs/daily-report.md に追記
2. tester エージェントに現状のテスト実行を委譲（ベースライン確認）
3. 実装を書く
4. reviewer エージェントに実装レビューを委譲
5. tester エージェントに最終テスト実行を委譲
```

### 観察ポイント

- メインコンテキストに **サブエージェントの作業ログが残らない** こと
- 戻ってくるのは **要約だけ** であること
- `reviewer` は Read-only なので、ファイル編集を要求すると断るはずであること

### 講師のフォローポイント

- サブエージェントに渡すプロンプトは **What to do を明確に**（Day1 第4章スライド47参照）
- 複数の委譲を **並行実行** させたければ、`/batch` 相当のプロンプトを試させる

---

## 8-6. Step 4: 振り返り（5分）

### 観点

- Hooks が守ってくれた場面は？
- サブエージェントに委譲してよかった点は？
- メインのコンテキスト消費はどう変わった？（`/context` で確認）
- 体験② と比べて、**人間の役割** はどう変わった？

### 次のステップ

体験④ では **Skills + Hooks で人気 Plugin の核を再実装** します。Hooks の応用（`PreToolUse` でブロック）を体験します。

---

## 8-7. この章のまとめ

- **Hooks（`PostToolUse`）** で品質ゲートを自動化
- **Agents 定義** で専門ロールを作り、`tools` を絞ってハーネス強制
- **Hub-and-Spoke** でサブエージェントに委譲し、メインコンテキストを汚さない
- 人間の役割は **監督する人** へ

---

## 次にやること

[☕ 10分休憩] → [第9章 体験④ TDD Guard 再実装](./ch09-exercise4-tdd-guard.md) へ進む。
