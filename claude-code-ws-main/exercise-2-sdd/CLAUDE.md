# プロジェクトルール

> 対応スライド: 15–16（CLAUDE.md）／ 17–19（Skills）

このファイルは Claude Code が毎ターン読むプロジェクトの「長期記憶」です。
参加者はこのファイルと `specs/daily-report.md`（配布済み仕様書）を読み、ルールと仕様を把握してから実装に入ります。

## 技術スタック

- フレームワーク: **React + TypeScript（Vite 前提）**
- テスト: **Vitest** + **React Testing Library**
- データ永続化: **localStorage**（DB は使わない）
- スタイル: CSS Modules または Tailwind（どちらでも可）

## コーディング規約

- 関数コンポーネントのみ使用する（クラスコンポーネント不可）
- 副作用は `useEffect` に閉じ込める
- Props には明示的な型注釈を付ける（`any` 禁止）

## ディレクトリ構造

```
src/
  main.tsx           ← エントリポイント
  App.tsx
  components/        ← 画面・UI コンポーネント
  lib/               ← ドメインロジック・バリデーション
__tests__/
  components/        ← コンポーネントのテスト
  lib/               ← ロジックのテスト
specs/
  daily-report.md    ← 仕様書（配布済み）
```

## テスト

- 新しい機能には必ずテストを書く
- 実行コマンド: `npm test -- --run`（Vitest の単発実行）
- テストファイルの命名: `src/foo/Bar.tsx` → `__tests__/foo/Bar.test.tsx`

# ブラウザ確認
- coder環境を用いているため、`npm run build`→`npm run preview`を利用してください。

## やってはいけないこと

- テストファイルを書き換えてテストを通すこと（実装側を直す）
- 仕様書にない機能を勝手に実装すること
- `any` / `// @ts-ignore` で型エラーを握りつぶすこと

## 仕様書の扱い

- 仕様書は `specs/` ディレクトリにある
- 実装前に必ず仕様書を読み、仕様に従うこと
- 仕様書にない機能は実装しないこと
- 仕様と実装が矛盾した場合は、**仕様書を正** として実装を直すか、先に仕様書を更新する
