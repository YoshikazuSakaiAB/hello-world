# Architecture Decision Records (ADR)

重要な設計判断を構造化して記録する仕組みです。**過去の議論をぶり返さず、使うほどにプロジェクトに馴染むエージェント** を実現するために AI が参照する主要な情報源です。

## 運用ルール

- ファイル名: `NNNN-short-title.md`（`NNNN` は 4 桁連番、例: `0001-use-postgres.md`）
- 配置先: `docs/adr/`
- 1 ADR = 1 決定
- Status は `Proposed` → `Accepted` → `Superseded by NNNN` / `Deprecated` と遷移
- **撤回せず、上書きもしない**。新しい判断で置き換える場合は新しい ADR を作り、旧 ADR の Status を `Superseded by NNNN` に更新

## 作成手順

1. [`NNNN-title.template.md`](./NNNN-title.template.md) をコピー
2. 番号を採番（`ls docs/adr/ | sort | tail -1` で確認）
3. ファイル名を `NNNN-具体的な決定内容.md` に変更
4. PR でレビューし、承認されたら Status を `Accepted` に変更

## AI エージェントとの連携

- `CLAUDE.md` に「新規設計判断時は `docs/adr/` を参照すること」と明記
- AI が既存 ADR を参照した場合、関連 ADR 番号を PR 本文に記載
- AI が新しい ADR を起案する場合、`Proposed` 状態で起案し、人間が承認
