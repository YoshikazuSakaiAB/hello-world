#!/bin/bash
# TDD Guard — PreToolUse Hook
# 
# このスクリプトは PreToolUse(Write|Edit) で呼ばれます。
# stdin から JSON を受け取り、書き込み先のファイルパスを取得。
# 対応するテストファイルが存在しなければ exit 2 でブロックします。
#
# === TODO: 参加者が実装してください ===

# 1. stdin から JSON を読み取る
INPUT=$(cat)

# 2. ファイルパスを取得
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // empty')

# パスが取れなかったら通過
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# 3. src/ 配下のファイルかチェック（src/ 以外は対象外）
# TODO: $FILE_PATH が "src/" で始まるかを判定
# ヒント: case "$FILE_PATH" in src/*) ... ;; *) exit 0 ;; esac


# 4. テストファイルのパスを組み立てる
# TODO: src/components/Foo.tsx → __tests__/components/Foo.test.tsx に変換
# ヒント: 
#   - "src/" を "__tests__/" に置換
#   - 拡張子の前に ".test" を挿入


# 5. テストファイルの存在チェック
# TODO: テストファイルが存在しなければ exit 2 + メッセージ
# ヒント:
#   if [ ! -f "$TEST_PATH" ]; then
#     echo "テストファイルが見つかりません: $TEST_PATH"
#     echo "TDD: まずテストを書いてください（Red → Green → Refactor）"
#     exit 2
#   fi


# 6. テストが存在すれば通過
exit 0
