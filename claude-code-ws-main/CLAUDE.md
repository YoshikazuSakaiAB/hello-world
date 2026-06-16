# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## このリポジトリの性格

社内ワークショップ **「Claude Code AI 駆動開発ワークショップ — Prompt → Context → Harness」** のハンズオン教材リポジトリ。コードベースというより **教材・テンプレート集** で、中身の大半は次の 3 種類：

1. **講義資料** — `docs/materials/ch00-…` 〜 `ch12-…` の章別マークダウン、ルートの `*.pptx` / `*.html`（スライドの実体）
2. **演習雛形** — `exercise-1-vibe/` / `exercise-2-sdd/` / `exercise-3-agentic/` / `exercise-4-advanced/` / `exercise-1-1-vibeWithSkill/` / `exercise-0-git/`（OPTIONAL: Git 未経験者向け補講）（各々独立した README + 雛形）
3. **3 層スタンダード** — `docs/layer1-dev-standards/` / `layer2-output-schemas/` / `layer3-context-repo/`（組織展開用のドキュメントテンプレート）

ルートに package.json は無く、リポジトリ全体に共通のビルド／テストコマンドは存在しない。

## 演習はチェーン構造（題材は同じ「日報アプリ」）

**`exercise-2-sdd` → `exercise-3-agentic` → `exercise-4-advanced`** は **同じ日報アプリを段階的に育てる** 設計。各 README の「事前準備」節で、前の演習から `cp -r src __tests__ specs CLAUDE.md package.json …` で成果物をコピーしてくる前提になっている。

- `exercise-1-vibe` は意図的に **Next.js**（捨てる前提のスタック）。Vibe の「ノリ」を体感するためだけの演習。
- `exercise-2-sdd` 以降は **Vite + React + TypeScript + Vitest** に固定（`exercise-2-sdd/CLAUDE.md` で宣言）。
- 各演習ディレクトリには **その演習用の `CLAUDE.md` / `.claude/settings.json` / `.claude-plugin/plugin.json` / Skill 雛形** が既に置かれていることがある。**演習ディレクトリで作業する場合、その配下の `CLAUDE.md` が優先される**（このルートファイルではなく）。

## ハーネス雛形の場所

| ファイル | 役割 |
|---|---|
| `exercise-3-agentic/.claude/settings.json` | Hooks 雛形（Step 1 で参加者が編集） |
| `exercise-3-agentic/.claude/agents/{reviewer,tester}.md` | Sub-agent 定義雛形 |
| `exercise-4-advanced/.claude/settings.json` | TDD Guard の PreToolUse Hook 登録先 |
| `exercise-4-advanced/.claude-plugin/plugin.json` | Plugin 化メタ情報 |
| `exercise-4-advanced/tdd-guard/SKILL.md` | TDD Guard Skill 本体 |
| `exercise-4-advanced/tdd-guard/scripts/check-test-exists.sh` | **TODO 付き** — 参加者が完成させる |
| `exercise-4-advanced/tdd-guard/scripts/check-test-exists.sample.sh` | 完成例（写経用） |

## 演習を実装するときの典型コマンド（参加者向け）

ルートでは何も実行できない。各演習ディレクトリ内で：

```bash
# 体験② を新規ブートストラップする場合（package.json が無い段階）
npm create vite@latest . -- --template react-ts
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# 既に体験② から引き継いだ場合
npm install
npm test -- --run        # Vitest 単発実行（演習で多用）
npx tsc --noEmit         # 型チェック
```

`exercise-2-sdd/CLAUDE.md` がテスト実行コマンドを `npm test -- --run` に固定しているので、Hooks やドキュメントを書くときも揃える。

## 教材を編集する際の注意

- **README.md / docs/materials/ / 各演習 README** の間でスライド番号・所要時間・進行が相互参照されている。片方だけ編集すると整合が崩れる（例: 体験③ は「70 min」、体験④ は「Day2 必修 55 min」で全箇所揃っている）。
- `docs/timeschedule.md` 第 7 節「積み残し」と各演習 README の所要時間表記は対になっている。タイムテーブルを動かすときは両方更新する。
- スライド `.pptx`（ソース）と `.html`（GitHub Pages 配信用、約 18MB）はファイル名が対応している。`docs(slides):` 系のコミットメッセージで両者を一緒に動かしている履歴がある（`git log --oneline` 参照）。
- ルート README.md の「進行順テーブル」「学習目標」「題材の流れ図」は **このリポジトリの目次** の役割を兼ねているので、演習を追加・名前変更したら必ず反映する。

## 言語

教材・README・コミットメッセージは **すべて日本語**。英語化しない。
