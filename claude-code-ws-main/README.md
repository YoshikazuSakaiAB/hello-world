# Claude Code ワークショップ — サンプルリポジトリ

社内ワークショップ **「Claude Code AI 駆動開発ワークショップ — Prompt → Context → Harness」** のハンズオン演習リポジトリです。

- **教科書**: `claude-code-ws-v2.pptx`（全 60 枚）/ [`docs/materials/`](./docs/materials/)（章別マークダウン）
- **進行表**: [`docs/timeschedule.md`](./docs/timeschedule.md)（連続 2 日・午後 × 2 / 各 4h）
- **実習ノート**: 本リポジトリ（`exercise-*/`）

## 📺 スライド（GitHub Pages 公開）

ブラウザでそのまま閲覧できます。

| WS | スライド | リンク |
|---|---|---|
| Claude Code AI 駆動開発ワークショップ | `claude-code-ws.html` | [▶ 開く](https://refactored-adventure-2qlpn72.pages.github.io/claude-code-ws.html) |
| Copilot → Claude Code · 操作の違いを学ぶ WS | `Copilot vs Claude Code WS .html` | [▶ 開く](https://refactored-adventure-2qlpn72.pages.github.io/Copilot%20vs%20Claude%20Code%20WS.html) |

## このリポジトリの目的

- スライド の各章で学んだ概念を、自分の手で動かして確かめる
- **Vibe → SDD → Agentic × SDD → Plugin 化** の 4 段階を同じ題材（日報アプリ）で追体験する
- 「原理を学び、操作に固執しない」— ツールは毎週進化するので、仕組みの理解を優先する

## セットアップ

```bash
git clone <このリポジトリのURL>
cd claude-code-ws
# 各演習は独立したディレクトリで進めます
```

> Claude Code の基本セットアップ（CLI インストール・ログイン）は[公式ドキュメント](https://docs.claude.com/claude-code)を参照。

---

## ワークショップ当日の進行順（Day1 → Day2）

### Day 1 — 原理 & Context Engineering（13:00–17:00）

| # | ディレクトリ | 体験 | パラダイム | スライド | 所要 |
|---|---|---|---|---|---|
| 2 | [`exercise-1-vibe/`](./exercise-1-vibe/) | **体験① Vibe Coding** | Prompt Eng. | 10–13 | 25 min |
| 5 | [`exercise-2-sdd/`](./exercise-2-sdd/) | **体験② SDD（仕様駆動）** | Context Eng. | 14–24 | 40 min |

第 0/1/3/4 章は講義のみ（`docs/materials/` 参照）。

### 🏠 Day1 → Day2 自宅課題（目安 30〜40 分）

[`docs/materials/homework.md`](./docs/materials/homework.md) を参照。

**体験② で作った日報アプリを題材に、5 工程（要件定義 → 仕様書作成 → 設計 → 開発 → 確認）の AI ハーネス構成** を Markdown 1 枚で持参（提出不要）。

- お題: 5 工程それぞれに Skill / Sub-agent / MCP / CLAUDE.md / 既存ツールを割り当て（Hook は Day2 で扱うため任意）。完成例つき
- TDD 制約: **③ 設計の開発ルール** にテスト先行 + 仕様適合チェックを規約化
- 成果物: 工程 × 要素マトリクス + ワークフロー図（Mermaid / 手描き / 図ツール、形式自由）+ 採用理由
- 当日: 冒頭で 3–4 人ずつ **5 分発表** → **講師が 1 案を選び、その構成案を体験③で全員でハーネス化**（② 仕様書作成〜⑤ 確認）

### Day 2 — Harness Engineering 本編 & スケール（13:00–17:00）

| # | ディレクトリ | 体験 | パラダイム | スライド | 所要 |
|---|---|---|---|---|---|
| 8 | [`exercise-3-agentic/`](./exercise-3-agentic/) | **体験③ Agentic × SDD** | Harness Eng. | 25–31, 36 | 70 min |
| 9 | [`exercise-4-advanced/`](./exercise-4-advanced/) | **体験④ TDD Guard 再実装（必修）** | Harness Eng. | 38–42, 45 | 55 min |

第 6/7/10/11/12 章は講義のみ（`docs/materials/` 参照）。

> **v2 での変更点**: 体験④は以前「Appendix / 選抜受講」でしたが、受講者アンケート（ハーネス Eng. 志向）を踏まえ **Day2 本編の必修パート** に格上げしました。

---

## オプション演習

| ディレクトリ | 位置づけ | スライド | 内容 |
|---|---|---|---|
| [`exercise-0-git/`](./exercise-0-git/) | **OPTIONAL**（前提知識補講・所要 45–60 min） | なし | Git 未経験者向け — init から PR まで手で 1 周し、後半 Claude Code に委ねて差分を観察 |
| [`exercise-1-1-vibeWithSkill/`](./exercise-1-1-vibeWithSkill/) | **OPTIONAL**（体験① の発展） | 17–19 | 公式 Skill を入れて Vibe がどう変わるかを体感 |

---

## 各体験の学習目標

| 体験 | ゴール |
|---|---|
| **体験⓪**（OPTIONAL） | リポジトリ／コミット／ブランチの 3 概念と、ローカル → リモート → PR の流れを 1 周して握る |
| **体験①** | 一言で始める速さと、品質・再現性の限界を体感する |
| **体験②** | 配布済み仕様書を読み、`CLAUDE.md` と合わせて AI を「ガイドする側」に回る感覚を掴む |
| **体験③** | Hooks と Agents 定義で「仕組みに品質を担保させる」設計を体験する |
| **体験④** | Skills + Hooks + Plugin 化で人気 Plugin の核心機能を再実装し、組織展開の足場を作る |

---

## 題材：日報アプリを一直線に育てる

**体験②→③→④ は同じ日報アプリを発展させていきます**。前の演習の成果物を `cp -r` で次のディレクトリにコピーして進めてください（各 README に手順あり）。

```
体験① Vibe で Next.js 日報（捨て）   ← スタックを切り替える意図的な断絶
         ↓
体験② Vite+React+Vitest で仕様駆動実装（ベース）
         ↓  [自宅課題(30-40分): 日報アプリ題材で5工程のハーネス構成を Markdown 1 枚で設計 → Day2冒頭で発表]
体験③ Hooks + Agents 定義でハーネス化（発展）
         ↓
体験④ TDD Guard を Skills+Hooks で再実装し Plugin 化（仕上げ）
```

> **技術スタック**:
> - 体験①: Next.js（Vibe の「ノリ」を優先して意図的に自由スタック）
> - 体験②以降: **Vite + React + TypeScript + Vitest**（CLAUDE.md で固定）

---

## 自習用の推奨順

当日に参加できなかった / 復習したい場合：

0. （Git 未経験者のみ）[`exercise-0-git/`](./exercise-0-git/) で init → コミット → ブランチ → PR を 1 周しておく
1. [`docs/materials/ch00-opening.md`](./docs/materials/ch00-opening.md) から順に読み進める
2. pptx スライド 10–13 → `exercise-1-vibe/`
3. pptx 14–24 → `exercise-2-sdd/`
4. （自宅課題） `docs/materials/homework.md`
5. pptx 25–31, 36 → `exercise-3-agentic/`
6. pptx 38–42, 45 → `exercise-4-advanced/`

---

## 関連ドキュメント

- [`docs/timeschedule.md`](./docs/timeschedule.md) — 2 日分の詳細タイムテーブル
- [`docs/materials/`](./docs/materials/) — 章別の講義資料マークダウン（pptx の補完）
- [`docs/README.md`](./docs/README.md) — AI 駆動開発 3 層スタンダード（組織展開用フレームワーク）

## 覚えておいてほしいこと

- 教えられたことはいつまでも正しくない。Claude Code は毎週 40〜60 件変わる
- 「原理」（Agent = Model + Harness）を学ぶ。具体操作は変化する
- 公式ドキュメントと Changelog が常に最新の教科書
