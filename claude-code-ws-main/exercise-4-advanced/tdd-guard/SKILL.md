---
name: tdd-guard
description: >
  This skill should be used when enforcing Test-Driven Development
  on a React + TypeScript + Vitest project. It blocks creating or
  editing files under src/ whenever a corresponding test file is
  missing under __tests__/, and guides the user to write the test
  first (Red → Green → Refactor).
  Trigger keywords: "TDD", "テスト駆動", "テストファースト",
  "Red-Green", "テストを先に", "品質ゲート".
  Do NOT use: for docs-only edits, config files, or non-src files.
---

# TDD Guard

## ルール

1. `src/` 配下のファイル（`.ts`, `.tsx`）を **新規作成・編集する前に**、
   対応するテストファイルが `__tests__/` に存在することを確認する

2. テストファイルの命名規則:
   - `src/components/DailyReportList.tsx` → `__tests__/components/DailyReportList.test.tsx`
   - `src/lib/validation.ts` → `__tests__/lib/validation.test.ts`

3. テストファイルが **存在しない** 場合:
   - まずテストファイルを作成する（Red: 失敗するテストを書く）
   - テストが失敗することを確認する
   - その後で実装ファイルを編集する（Green: テストを通す）

4. テストファイルが **存在する** 場合:
   - 実装を進めてよい
   - 実装後にテストが通ることを確認する

## TDD サイクル

```
Red   → 失敗するテストを書く
Green → テストを通す最小の実装を書く
Refactor → リファクタリングする（テストは通ったまま）
```

## 検証コマンド

```bash
npm test -- --run
```
