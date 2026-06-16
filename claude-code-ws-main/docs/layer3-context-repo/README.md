# Layer 3 — コンテキストリポジトリ構造ルール

> AI の生成品質はインプットの質に直結する — **最も重要なレイヤー**。

プロジェクト知識（インタビュー / ペルソナ / 調査 / 要件 / 意思決定）をテキストベースで構造化し、Git で変更履歴を管理するリポジトリです。Layer 2 の AI 出力スキーマへの入力ソースとなります。

## 推奨ディレクトリ構造

```
context-repo/
├── interviews/
│   ├── 2025-03-15_stakeholder-A.md
│   └── template.md
├── personas/
│   ├── persona-primary-user.md
│   └── template.md
├── research/
│   ├── competitor-analysis.md
│   └── template.md
├── journeys/
│   ├── user-journey-onboarding.md
│   └── template.md
├── requirements/
│   ├── business-constraints.md
│   └── non-functional-requirements.md
├── decisions/
│   └── product-decision-log.md
└── README.md
```

## 各ディレクトリの雛形

| ディレクトリ | テンプレート | 目的 |
|---|---|---|
| `interviews/` | [template.md](./interviews/template.md) | 発言の要約ではなく、構造化された記録 |
| `personas/` | [template.md](./personas/template.md) | ユーザー視点の仕様を生成するための基盤 |
| `journeys/` | [template.md](./journeys/template.md) | 網羅的なユーザーストーリー生成のため |
| `research/` | [template.md](./research/template.md) | エビデンスベースの提案のため |
| `requirements/` | [business-constraints.template.md](./requirements/business-constraints.template.md) / [non-functional-requirements.template.md](./requirements/non-functional-requirements.template.md) | スコープと制約を正確に伝えるため |

## 運用ルール

### ファイル命名

- インタビュー: `YYYY-MM-DD_対象者.md`
- ペルソナ: `persona-<役割>.md`（`persona-primary-user.md` など）
- 調査: `research-<テーマ>.md`
- ジャーニー: `user-journey-<シナリオ>.md`

### 記述フォーマット

- **要約ではなく構造化**: 感想・結論ではなく、要素（誰が / 何を / なぜ / 優先度）で分解
- **発言の原文は引用形式**で保持し、解釈と分離
- **定量データ** は Markdown のテーブル、または CSV/JSON を同ディレクトリに同梱

### 更新ルール

- 変更は Git で記録（AI が差分を追跡可能）
- 破壊的な書き換えは避け、古い情報は `archived/` に移動
- `decisions/product-decision-log.md` に重要な意思決定を時系列で記録

## AI エージェントとの連携

- StRS 生成時、AI は `interviews/` と `personas/` を参照して要求を抽出
- SRS 生成時、AI は `journeys/` を参照してユーザーストーリーを網羅的に生成
- アーキテクチャ・DB スキーマ生成時、AI は `requirements/non-functional-requirements.md` を参照
