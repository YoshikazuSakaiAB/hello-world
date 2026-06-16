# Contributing Guide

## ブランチ戦略

{{以下から 1 つ選択、または独自戦略を記述}}

### Option A: Trunk-based Development（推奨 / 少人数・高頻度リリース向け）

- `main` は常にリリース可能
- 短命なフィーチャーブランチ（1〜2 日以内にマージ）
- Feature Flag で未完成機能をガード

### Option B: GitHub Flow

- `main` からフィーチャーブランチを作成
- PR を作成しレビュー後に `main` にマージ
- マージ後、即デプロイ

### Option C: Git Flow（複雑なリリースサイクル向け）

- `main` / `develop` / `feature/*` / `release/*` / `hotfix/*`

## ブランチ命名

- `feat/<短い説明>` — 新機能
- `fix/<短い説明>` — バグ修正
- `refactor/<短い説明>` — リファクタ
- `docs/<短い説明>` — ドキュメント

## コミットメッセージ（Conventional Commits）

```
<type>(<scope>): <subject>

<body>  # なぜこの変更が必要かを書く

<footer>  # BREAKING CHANGE / Issue 番号など
```

| type | 用途 |
|---|---|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみ |
| `style` | フォーマットのみ（意味変化なし） |
| `refactor` | 機能変化を伴わないコード改善 |
| `test` | テスト追加・修正 |
| `chore` | ビルド・ツール設定など |
| `perf` | パフォーマンス改善 |

## Pull Request

### タイトル

- Conventional Commits の形式に従う
- 70 文字以内

### 本文（必須セクション）

```markdown
## Summary
- 何を変更したか（1〜3 点）

## Why
- なぜ必要か（リンクするIssue / 仕様 / ADR）

## Test plan
- [ ] ユニットテスト追加
- [ ] 手動確認手順

## Checklist
- [ ] 関連ドキュメント・ADR を更新した
- [ ] 破壊的変更がある場合は BREAKING CHANGE を明記
```

### レビュー

- 最低 1 名のレビュー承認
- CI が全てグリーン
- コンフリクト解消済み

## AI エージェント利用時のルール

- AI が生成した変更も **必ず人間がレビュー**
- AI が参照した仕様書 / ADR を PR 本文にリンク
- AI は `--no-verify` でフックをスキップしない
