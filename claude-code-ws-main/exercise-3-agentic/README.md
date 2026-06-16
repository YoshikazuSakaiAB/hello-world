# 体験③ Agentic × SDD — 日報アプリにハーネスを組み込む

> **対応スライド**: 25–31（Agentic × SDD）／ 28–29（Hooks）／ 20–21（Agents 定義）／ 36（Hub-and-Spoke）
> **進行章**: Day2 第 8 章 / **70 分**（v2 で +10 min 拡張）
> **パラダイム**: Harness Engineering — 「どう動かすか」で勝負

## 学習目標

- 体験② で見えた「AI はルールを 100% は守らない」を、**Hooks で物理的に強制** する
- 体験② でメインがすべてやっていた作業を、**Agents 定義** で専門ロールに委譲する感覚を掴む
- **Hub-and-Spoke** で並行作業する構造を自分のセッションで観察する

## お題

体験② の日報アプリに以下 3 つを組み込み、**新機能を Hub-and-Spoke で追加** します。

1. **Hooks 設定** — ファイル変更のたびに型チェック＋テストを自動実行
2. **Agents 定義** — `reviewer` / `tester` を独立コンテキストで動かす
3. **委譲** — メインから 2 エージェントに並行委譲して新機能を実装

### 実装題材は当日決定

v3 では、**Day2 冒頭の発表中に講師が選んだ受講生の自宅課題（5 工程のハーネス構成案）** を、そのままこの演習の実装題材にします。

- 対象範囲: **② 仕様書作成 〜 ⑤ 確認** の 4 工程（① 要件定義はスコープ外）
- 選ばれた構成案の **Skill / Agent / Hook 配置** に沿って、Step 1–3 を実際に組む
- 自宅課題で立てた **③ 設計の TDD 規約**（テスト先行 + 仕様適合チェック）が、④ 開発 / ⑤ 確認でどう発動するかを観察
- 「自分が設計した通りに AI が動くか」「設計から漏れた場面はどこか」を体感する場

> **フォールバック**: 当日の自宅課題が薄い / 選定が難しい場合は、以下の **題材 A**（ダークモード）または **題材 B**（投稿数グラフ）にフォールバックします（後述）。

---

## 事前準備

体験② の成果物をこのディレクトリにコピー（**`__tests__/` も必ず含める**）。

```bash
cp -r ../exercise-2-sdd/src ./src
cp -r ../exercise-2-sdd/__tests__ ./__tests__
cp -r ../exercise-2-sdd/specs ./specs
cp ../exercise-2-sdd/CLAUDE.md ./CLAUDE.md
cp ../exercise-2-sdd/package.json ./package.json
cp ../exercise-2-sdd/package-lock.json ./package-lock.json 2>/dev/null || true
cp ../exercise-2-sdd/vite.config.ts ./vite.config.ts 2>/dev/null || true
cp ../exercise-2-sdd/tsconfig.json ./tsconfig.json 2>/dev/null || true
npm install
```

> `package.json` が無ければ体験② でプロジェクト作成まで到達できていません。Claude Code に `npm create vite@latest . -- --template react-ts && npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom` 相当で作り直してもらってください。

このディレクトリには **Hooks / Agents の雛形が既に入っています**（`.claude/` 配下）。まずはこの中身を眺めてください。

```
.claude/
├── settings.json            ← Step 1 で使う Hooks 雛形（空）
└── agents/
    ├── reviewer.md          ← Step 2 で編集する reviewer 雛形
    └── tester.md            ← Step 2 で編集する tester 雛形
```

---

## 進め方（70 分）

| 時間 | Step | やること | スライド |
|---|---|---|---|
| 0–15 min | ① | Hooks を設定 | 28–29 |
| 15–40 min | ② | Agents 定義を書く | 20–21 |
| 40–65 min | ③ | サブエージェントに委譲して新機能追加 | 30–31, 36 |
| 65–70 min | ④ | 振り返り | — |

---

## Step 1: Hooks 設定（15 分）

`.claude/settings.json` を開いて、以下に差し替えます：

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

- **`PostToolUse` × `Write|Edit`** — ファイル変更のたびに `tsc` と `vitest` を自動実行
- 非ゼロ終了で Claude のコンテキストにエラーが戻り、次のターンで修正を試みる

### 動作確認

Claude Code を起動して、何か小さな編集を頼みます：

```text
src/App.tsx の先頭コメントを 1 行だけ追加してください。
```

`Write`/`Edit` の後に tsc + vitest が走ることを確認してください。エラーが出る場合は AI が自発的に修正します。

---

## Step 2: Agents 定義を書く（25 分）

`.claude/agents/reviewer.md` と `tester.md` を編集します。雛形は既にあるので、以下の指示に従って中身を埋めてください。

### reviewer.md（仕様と実装の整合チェック）

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

You are a code reviewer. For each acceptance criterion in `specs/`:

1. Read the spec
2. Read the implementation in `src/`
3. Check: does the implementation satisfy the criterion?
4. Return a table with columns: `#` | `criterion` | `✅/❌` | `evidence`

Do NOT edit any files. Only read and report.
```

### tester.md（Vitest 実行専任）

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

### ポイント（スライド 20 の Front Matter 表）

| プロパティ | 指定 | 効果 |
|---|---|---|
| `tools` | 必要最小限 | **物理的に編集不可** にできる（ハーネス強制の実例） |
| `model` | `sonnet` / `haiku` | コスト制御。単純なタスクは haiku でも OK |
| `description` | **三人称 + When 条件** | AI が委譲判断する時の唯一の材料 |

---

## Step 3: サブエージェントに委譲して新機能追加（25 分）

**第一選択**: 当日選ばれた受講生の構成案に従って `specs/` を作成し、メインエージェントから委譲します。仕様の範囲・粒度は選ばれた構成案に合わせて講師がその場で調整。

**フォールバック**: 当日選定が難しい場合は、以下の **題材 A** または **題材 B** に切り替えます。

### 題材 A（フォールバック） — ダークモード

```markdown
# specs/dark-mode.md
## 受入条件
- [ ] ヘッダーにダーク / ライト切替トグルがある
- [ ] トグル状態は localStorage に保存される
- [ ] 全画面がダークモードに対応する
- [ ] OS 設定に応じて初期値が決まる
```

### 題材 B（フォールバック） — 投稿数グラフ

```markdown
# specs/chart.md
## 受入条件
- [ ] 一覧画面の上部に過去 7 日間の棒グラフを表示
- [ ] 日付ごとの投稿数を表示
- [ ] 投稿がない日は 0 と表示
- [ ] カテゴリ別の色分けがある
```

### 委譲プロンプト例（Hub-and-Spoke）

```text
specs/dark-mode.md の仕様を実装してください。手順:

1. まず tester エージェントに現状のテスト実行を委譲（ベースライン確認）
2. 実装を 1 受入条件ずつ進める（テストも並行して追加）
3. 1 条件ごとに reviewer エージェントに「仕様と実装の整合チェック」を委譲
4. 最後に tester エージェントで全テストが通ることを確認
```

### 観察ポイント

- **メインのコンテキストが汚れない** — サブエージェントはフォークされ、**要約だけ**を親に返す
- **Hooks と併走** — `Write/Edit` のたびに PostToolUse が走る。サブエージェント側でも走る
- **権限の壁** — reviewer は Read-only。仕様を直そうとしても物理的にできない

---

## Step 4: 振り返り（5 分）

```text
### Hooks で何が変わった？
- ルール違反をどう防いだ？:
- 体験② で AI がサボっていた場面が Hook で止められた？:

### Agents 定義で何が変わった？
- メインのコンテキストが汚れなくなった？:
- reviewer と tester の分業感:
- コスト（モデル選択）の意識:

### 体験② と比べて
- 速さ:
- 安心感:
- 設定の手間（＝先行投資）:
```

---

## 次へ（体験④ 本編必修）

体験③ で自分の手で書いた Hooks + Agents を、**Plugin 化してチーム配布できる形** にするのが体験④です。

→ [`../exercise-4-advanced/`](../exercise-4-advanced/) で Superpowers の「TDD 強制」を Skills + Hooks で再実装（Day2 **必修**）。

## 関連資料

- [`../docs/materials/ch07-hooks.md`](../docs/materials/ch07-hooks.md) — Hooks 入門（第 7 章）
- [`../docs/materials/ch08-exercise3-agentic.md`](../docs/materials/ch08-exercise3-agentic.md) — 体験③ 講義資料
- [`../docs/materials/ch10-architecture.md`](../docs/materials/ch10-architecture.md) — オーケストレーション深掘り
