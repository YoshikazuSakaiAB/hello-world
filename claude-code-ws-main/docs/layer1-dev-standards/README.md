# Layer 1 — 組織の開発規約

一度整備すれば全プロジェクトで再利用できる標準基盤。**プロダクトリポ** または **標準テンプレートリポ** に配置します。

## 狙い

- ESLint などのツールでルールを強制（人間の注意に頼らない）
- `CLAUDE.md` / `instructions.md` で **AI の行動を制御**
- CI/CD で品質ゲートを自動化（lint → test → security check）
- ADR で過去の設計判断を記録し、AI が参照できる状態にする
- レトロスペクティブで組織的な学びを蓄積（Lean 原則「Amplify Learning」）

## 雛形一覧

| 雛形 | 配置先例 | 目的 |
|---|---|---|
| [CLAUDE.template.md](./coding-standards/CLAUDE.template.md) | リポジトリ直下 | **ポインタ型の軽量 AI 行動制御**（50〜100 行目安、詳細は外部参照） |
| [instructions.template.md](./coding-standards/instructions.template.md) | `.github/` または直下 | 人間 + AI 向けコード規約ハブ |
| [eslintrc.template.json](./coding-standards/eslintrc.template.json) | リポジトリ直下 | ツールによる規約強制の例 |
| [ci.template.yml](./ci-cd/ci.template.yml) | `.github/workflows/ci.yml` | lint → test → security check の品質ゲート |
| [CONTRIBUTING.template.md](./CONTRIBUTING.template.md) | リポジトリ直下 | ブランチ戦略 + PR 運用 + コミット規約 |
| [ADR](./adr/README.md) | `docs/adr/` | 設計判断を構造化して記録 |
| [レトロスペクティブ](./retrospectives/YYYY-MM-DD.template.md) | `retrospectives/` | KPT + メトリクス + 改善アクション |

## XP 準拠の品質基準（例）

- 関数 50 行以内
- 循環的複雑度 10 以下
- ファイル 300 行以内
- 重複コードは即リファクタ

これらは `.eslintrc.json` などのツールで機械的にチェックし、`CLAUDE.md` にも明記して AI の生成を制約します。
