#!/bin/bash
# TDD Guard — PreToolUse Hook の完成例（参照用）
#
# 詰まった時だけ参照してください。まずは check-test-exists.sh の TODO を
# 自分で埋めることをお勧めします。
#
# 使い方: PreToolUse(Write|Edit) として呼ばれ、stdin から JSON を受け取り
#   - テスト未作成の src/*.ts(x) への書込 → exit 2（ブロック）
#   - それ以外                          → exit 0（許可）

set -euo pipefail

# 1. stdin から JSON を読み取る
INPUT=$(cat)

# 2. ファイルパスを取得
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // empty')

# パスが取れなかったら通過（無関係なツール呼び出し）
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# 3. src/ 配下のファイルかチェック（src/ 以外は対象外）
case "$FILE_PATH" in
  src/*) ;;
  *) exit 0 ;;
esac

# .ts / .tsx のみを対象にする（画像・CSS などは通す）
case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

# 4. テストファイルのパスを組み立てる
#    src/foo/Bar.tsx  → __tests__/foo/Bar.test.tsx
#    src/lib/util.ts  → __tests__/lib/util.test.ts
TEST_PATH="${FILE_PATH/#src\//__tests__/}"
TEST_PATH="${TEST_PATH%.*}.test.${FILE_PATH##*.}"

# 5. テスト実装そのものへの編集は許可（テストは先に書いていい）
case "$FILE_PATH" in
  __tests__/*) exit 0 ;;
esac

# 6. テストファイルの存在チェック
if [ ! -f "$TEST_PATH" ]; then
  echo "テストファイルが見つかりません: $TEST_PATH" >&2
  echo "TDD: まずテストを書いてください（Red → Green → Refactor）" >&2
  exit 2
fi

# 7. テストが存在すれば通過
exit 0
