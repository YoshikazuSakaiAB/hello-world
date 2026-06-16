# Claude Code AI駆動開発ワークショップ 資料（v2 / 章別マークダウン）

> **対応タイムスケジュール**: [`docs/timeschedule.md`](../timeschedule.md)（連続2日・午後×2・13:00–17:00）
> **元資料**: `claude-code-ws.pptx`（全60枚）
> **重心**: ハーネスエンジニアリング（受講者アンケート反映）

---

## この資料の使い方

- **講師向け**: 章（`ch*.md`）の順に読めば、そのまま当日の進行台本になります。各章の冒頭に「時間 / 対応スライド / ねらい / アジェンダ」を明記。
- **受講者向け**: 気になった章だけ拾い読みできます。章内は小見出し単位で読み切れる分量に分割。
- **自習向け**: Day1 → Day2 の順に読み進め、各章末の「次にやること」に従うと演習にも取り組めます。

---

## Day1（13:00–17:00 / 240分） — 原理 & Context Engineering

| # | 章 | 時間 | 対応スライド | ファイル |
|---|---|---|---|---|
| 0 | オープニング / この教育の位置づけ | 15分 | 1, 3 | [`ch00-opening.md`](./ch00-opening.md) |
| 1 | 原理編：AI エージェントと開発手法の変遷 | 45分 | 4–9 | [`ch01-principles.md`](./ch01-principles.md) |
| 2 | 体験① Vibe Coding（デモ＋限界診断） | 25分 | 10–13 | [`ch02-vibe.md`](./ch02-vibe.md) |
| 3 | SDD 理論 / CLAUDE.md / Context Engineering | 35分 | 14–16, 43, 46 | [`ch03-sdd-context.md`](./ch03-sdd-context.md) |
| 4 | ハーネス構成要素①：Skills / Agents / MCP | 45分 | 17–22, 47 | [`ch04-skills-agents-mcp.md`](./ch04-skills-agents-mcp.md) |
| 5 | 体験② SDD ハンズオン | 50分 | 23, 24 | [`ch05-exercise2-sdd.md`](./ch05-exercise2-sdd.md) |

自宅課題（30〜40分・提出不要）: [`homework.md`](./homework.md)

## Day2（13:00–17:00 / 240分） — Harness Engineering & スケール

| # | 章 | 時間 | 対応スライド | ファイル |
|---|---|---|---|---|
| 6 | Day1 振り返り / Day2 の狙い | 10分 | 32, 33 | [`ch06-day2-kickoff.md`](./ch06-day2-kickoff.md) |
| 7 | Hooks 入門：決定論的品質ゲート | 30分 | 28, 29, 48 | [`ch07-hooks.md`](./ch07-hooks.md) |
| 8 | 体験③ Agentic × SDD ハンズオン | 70分 | 25–27, 30, 31, 36 | [`ch08-exercise3-agentic.md`](./ch08-exercise3-agentic.md) |
| 9 | 体験④ TDD Guard 再実装（必修） | 55分 | 38, 39, 41, 42, 45 | [`ch09-exercise4-tdd-guard.md`](./ch09-exercise4-tdd-guard.md) |
| 10 | エージェントアーキテクチャ深掘り | 30分 | 34–37, 44, 49–57 | [`ch10-architecture.md`](./ch10-architecture.md) |
| 11 | スケール編：AI駆動開発 3層スタンダード | 20分 | docs/（本編外資料） | [`ch11-three-layer-standard.md`](./ch11-three-layer-standard.md) |
| 12 | 明日からの3ステップ / 締め | 5分 | 58–60 | [`ch12-closing.md`](./ch12-closing.md) |

---

## 資料の編集方針

- **章は時間順**: タイムスケジュールの進行順 = ファイル番号順
- **各章の冒頭に時間と対応スライドを記載**: 60分資料と30分資料が同じ見た目にならないよう、先頭に「時間配分の表」を置く
- **図は ASCII で表現**: スライドの図はそのまま再現できないため、構造が伝わる ASCII / Markdown 表に置換
- **演習は「進め方」を分単位で**: ハンズオン章は `exercise-*/README.md` を補完する形で「講師がどう進めるか」を書く（学生向け手順は exercise ディレクトリの README を参照）
- **補足スライド（43–57）は該当章に織り込み**: 章末「さらに深く」節に必要な分だけ

---

## 積み残し

[`docs/timeschedule.md`](../timeschedule.md) 末尾の「積み残し」節を参照。
