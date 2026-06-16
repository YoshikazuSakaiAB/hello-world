# 第9章：体験④ TDD Guard 再実装（必修）

| 項目 | 内容 |
|---|---|
| **時間** | 15:00–15:55（55分） |
| **対応スライド** | 38, 39, 41, 42, 45 |
| **形式** | ハンズオン（個人演習） |
| **ねらい** | Skills + Hooks + Plugin 化で **Superpowers 系 Plugin の核を自分で再実装** する |
| **演習ディレクトリ** | [`exercise-4-advanced/`](../../exercise-4-advanced/) |

> **旧版は Appendix（選抜受講）扱いでしたが、アンケート反映で Day2 本編の必修パートに格上げ** しました。ハーネスエンジニアリングの集大成です。

---

## アジェンダ（55分）

| 分 | 内容 | スライド |
|---|---|---|
| 0–5 | なぜ人気 Plugin を自分で再実装するか | 45, 42 |
| 5–15 | SKILL.md を書く | 42, 19 |
| 15–30 | `check-test-exists.sh` を実装 | 42 |
| 30–40 | 動作確認（ブロック／許可） | 42 |
| 40–50 | Plugin 化（`.claude-plugin/`） | 39 |
| 50–55 | 振り返り＋自己学習ループの紹介 | 41 |

---

## 9-1. 今なぜ人気 Plugin を自分で再実装するか（スライド45, 42）

### 注目 Plugin ランキング（2026年4月時点）

| 名前 | スター | 核心コンセプト | 学べること |
|---|---|---|---|
| **Superpowers** | 143K | 7 フェーズ SDD + TDD 強制 | 開発プロセスの制約 |
| Everything Claude Code | 140K | 28 エージェント + 自己学習 | ハーネス性能最適化 |
| AutoResearch（Karpathy） | 65K | 修正→実験→計測→保持 | PGE ループの実装 |
| gstack（Garry Tan） | 50K | 23 ロール別コマンド | 意思決定の視点分離 |
| oh-my-claudecode | 26K | チーム優先マルチエージェント | オーケストレーション |

### 共通する設計思想

> **全て Skills + Hooks + Agents の組合せで実現されている。特別な魔法はない。**
>
> この WS で学んだ原理を理解していれば、どのフレームワークも読み解ける。

### 今日のお題

**Superpowers の「TDD 強制」を Skills + Hooks で再現する**

- **テストを書く前にコードを書いたら自動ブロック**
- 外部ライブラリ不要
- `SKILL.md` + `settings.json` + シェルスクリプトだけで実装

### この体験で身につくこと（スライド42）

| 要素 | 学習内容 |
|---|---|
| **Skills の設計** | `description` でトリガー条件を制御 |
| **Hooks の実装** | `PreToolUse` で品質ゲートを挿入 |
| **Plugin 化の手順** | チーム配布可能なパッケージ作成 |
| **原理の理解** | 143K スター Plugin も Skills+Hooks の組合せ |

---

## 9-2. Step 1: SKILL.md を書く（10分）

### ディレクトリ構造

```
exercise-4-advanced/
  └─ tdd-guard/
      ├─ SKILL.md
      └─ scripts/
          └─ check-test-exists.sh   (Step 2 で実装)
```

### SKILL.md の雛形

```markdown
---
name: tdd-guard
description: >
  This skill should be used when the user asks to implement a new feature,
  function, or component (TDD、テストファースト、Red-Green、機能追加 等のキーワード時).
  It enforces test-first development by blocking writes to source files
  that have no corresponding test file.
  NOT for documentation or config changes.
allowed-tools: Read, Bash
---

# TDD Guard

When implementing a new feature:

1. Check whether a test file exists for the target module
   - convention: `src/foo.ts` → `__tests__/foo.test.ts`
2. If no test exists, STOP and ask the user to write the test first
3. Only after the test exists, proceed to implementation
4. Run `npm test -- --run` after each change to verify Red → Green
```

### 講師のフォローポイント

- `description` は **三人称・When・NOT 条件** を揃える（Day1 第4章）
- `allowed-tools` で Skill が使えるツールを制限

---

## 9-3. Step 2: `check-test-exists.sh` を実装（15分）

### 仕様

- 引数: 編集対象ファイルパス（例：`src/DailyReport.tsx`）
- 振る舞い:
  - テストファイルが存在する → **終了コード 0**（OK、編集を許可）
  - テストファイルが存在しない → **終了コード 2**（NG、編集をブロック。Claude Code の Hooks 仕様では `exit 2` がブロックに相当）
- 命名規則: `src/foo.ts` ↔ `__tests__/foo.test.ts`

### スクリプトの雛形

```bash
#!/usr/bin/env bash
set -euo pipefail

# Claude Code が PreToolUse で渡してくる JSON 入力から編集対象ファイルを取り出す
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# TDD の対象外はスキップ（テストファイル自体、ドキュメント等）
case "$FILE_PATH" in
  *__tests__*) exit 0 ;;
  *.test.*)    exit 0 ;;
  *.md)        exit 0 ;;
  "")          exit 0 ;;
esac

# src/foo.ts → __tests__/foo.test.ts に変換
BASE=$(basename "$FILE_PATH")
NAME="${BASE%.*}"
EXT="${BASE##*.}"
TEST_FILE="__tests__/${NAME}.test.${EXT}"

if [[ -f "$TEST_FILE" ]]; then
  exit 0  # OK
else
  echo "TDD Guard: no test file found for $FILE_PATH (expected $TEST_FILE)" >&2
  exit 2  # BLOCK（Claude Code Hooks の仕様）
fi
```

### `settings.json` に Hook を登録

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash tdd-guard/scripts/check-test-exists.sh"
          }
        ]
      }
    ]
  }
}
```

### 講師のフォローポイント

- **テストファイル自体を編集する時は許可** する（スキップ条件）
- `PreToolUse` は **ブロック** できるのが肝（`PostToolUse` は「後で叱る」だけ）
- `exit 2` のメッセージは **AI のコンテキストに戻る** ので、AI が何をすべきか理解できるように書く

---

## 9-4. Step 3: 動作確認（10分）

### テスト①: ブロックされるケース

```
User「src/NewFeature.tsx を作って、ボタンを1つ配置して」
  ↓
AI が Write ツール呼び出し
  ↓
PreToolUse hook が発火
  ↓
__tests__/NewFeature.test.tsx が存在しない → exit 2
  ↓
Write がブロックされ、AI にエラーメッセージが返る
  ↓
AI「先にテストを書きます」と方針転換
```

### テスト②: 許可されるケース

```
User「まず __tests__/NewFeature.test.tsx を作って」
  ↓
Write（テストファイル自体） → スキップ条件にマッチ → exit 0 → 成功
  ↓
User「では src/NewFeature.tsx を実装して」
  ↓
__tests__/NewFeature.test.tsx が存在する → exit 0 → 成功
```

### 観察ポイント

- AI が **自動で方針転換** してテストを先に書くか？
- エラーメッセージが **十分なヒント** になっているか？
- CLAUDE.md に書いた「TDD を守って」とどう違うか？（Hooks は物理的に止まる）

---

## 9-5. Step 4: Plugin 化（10分）

### Plugin の構造（スライド39）

```
tdd-guard-plugin/
  ├─ .claude-plugin/
  │   └─ plugin.json      ← メタデータ
  ├─ skills/
  │   └─ tdd-guard/SKILL.md
  ├─ hooks/
  │   └─ hooks.json       ← 共有 Hooks
  └─ scripts/
      └─ check-test-exists.sh
```

### plugin.json の雛形

```json
{
  "name": "tdd-guard",
  "version": "0.1.0",
  "description": "Enforces test-first development by blocking Write/Edit on source files without tests",
  "author": "Your Name",
  "hooks": "hooks/hooks.json"
}
```

### 組織への展開フロー（スライド39）

```
1. 開発         個人で Plugin を作成・テスト
     ↓
2. 公開         GitHub リポジトリに push
     ↓
3. インストール  claude plugin add <repo>
     ↓
4. 運用         claude plugin update で全員に配信
```

> **全員がゼロから作らない。組織のハーネスを Plugin として標準化する。**

---

## 9-6. Step 5: 振り返り＋自己学習ループ（5分）

### 体験④ の学び

- `PreToolUse` は **物理的ブロック** = CLAUDE.md にはできないこと
- Skills は **description で発火条件を制御**
- Plugin 化で **チーム標準化**

### 自己学習ループの紹介（スライド41）

```
Plan   →   Generate   →   Evaluate
要件分析   コード生成     品質基準で採点
改善方針   デザイン実装   合格/不合格
                              ↓
                         不合格 → Plan に戻る（最大 N 回）
```

### ループ設計のポイント

| 原則 | 実践 |
|---|---|
| **目標を高く設定** | Evaluate の採点基準を厳しくする |
| **ループ上限を決める** | `maxTurns` で無限ループ防止 |
| **差分だけ修正** | Evaluate で指摘された箇所だけ |

> 今日作った TDD Guard に、さらに `Stop Hook` で CLAUDE.md を自動更新する仕組みを足せば、**自己学習ループ** の最小構成が組めます。

---

## 9-7. この章のまとめ

- 人気 Plugin（Superpowers）の核を **Skills + Hooks + Plugin 化** で再実装した
- `PreToolUse` は **物理的ブロック** できる（LLM が覆せない）
- Plugin 化で **チーム配布可能な標準ハーネス** が作れる
- 自己学習ループ（Plan → Generate → Evaluate）は応用の入口

---

## 次にやること

[☕ 10分休憩] → [第10章 エージェントアーキテクチャ深掘り](./ch10-architecture.md) へ進む。
