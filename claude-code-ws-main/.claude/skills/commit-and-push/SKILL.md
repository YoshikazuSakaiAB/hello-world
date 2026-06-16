---
name: commit-and-push
description: >
  変更をコミットしてリモートへプッシュするスキル。
  ユーザーが作業をひと区切りつけてリモートに反映したいときに使う。
  実行前に変更内容と機密ファイルの混入を確認し、Conventional Commits
  に沿ったコミットメッセージを Claude が提案してユーザーの承認を得る。
  コミットは「内容のまとまり」ごとに分割することを推奨。最後に
  現在ブランチを origin へプッシュする（main へのプッシュも許可）。
  トリガーキーワード: "コミットして", "プッシュして", "変更を保存",
  "リモートに反映", "commit", "push", "save changes".
  Do NOT use: 変更が一切ない場合、ユーザーが自分で
  git add / git commit / git push を実行しようとしている場合、
  PR 作成が目的の場合（その場合は別途 PR 作成手順を案内）。
---

# Commit & Push — コミット・プッシュスキル

## 目的

このスキルは git の「変更を残してリモートへ送る」一連の作業で
起きがちなミスを防ぐためにある。典型的なミス:

- `git add -A` / `git add .` で機密ファイル（`.env` など）や
  個人設定ファイル（`settings.local.json`）を巻き込む
- 何が入っているか把握せずに 1 コミットに詰め込む
- コミットメッセージが「fix」「update」だけで後から追えない
- main に直接プッシュしてよい変更か判断せずに push する

---

## 手順（5 ステップ）

### Step 1 — 変更内容の把握

```bash
git status
git diff
git diff --staged
git log --oneline -5
```

**なぜ全部見るか**:

- `git status`: 変更ファイル一覧と untracked の検出
- `git diff` / `git diff --staged`: 変更の中身を読んでコミット
  メッセージを書くため
- `git log --oneline -5`: そのリポジトリのコミットメッセージ
  スタイル（プレフィックス、日本語/英語、絵文字の有無）を踏襲するため

変更が一切なければ **ここで終了** し、ユーザーに「変更がありません」
と報告する。

---

### Step 2 — 機密・個人設定ファイルのチェック

untracked / modified の中に以下のファイルが含まれていないか確認する：

- `.env` / `.env.*` / `*.pem` / `*.key` / `credentials*.json`
- `**/.claude/settings.local.json`（個人ごとの permissions が入る）
- `**/secrets/**`

**該当ファイルがあった場合**: コミット対象に **含めない** ことを
デフォルトとし、ユーザーに以下を提示する：

```
以下のファイルは機密または個人設定の可能性があります：
  - <file path>

A) コミット対象から外す（推奨）
   → 必要なら .gitignore への追加も提案します
B) それでもコミットする
   → 中身を確認してから明示的に許可してください
```

ユーザーが A を選んだら `.gitignore` への追加を提案、
B を選んだら中身を Read で確認してから進む。

---

### Step 3 — ステージングとコミット単位の設計

**① コミット粒度の判断**

`git diff` の内容を読み、変更を「論理的なまとまり」で分割する。
目安：

- 別ディレクトリ・別目的の変更は別コミット
  （例: `docs/` の修正と `src/` の修正は分ける）
- 機能追加 + その機能のテスト + 関連ドキュメント = 1 コミット
- 機械的な置換（リネーム等）と機能変更は分ける

複数コミットに分けると判断したら、**Step 4 → Step 5 をコミットの数だけ繰り返す**。

**② ステージング**

```bash
git add <file1> <file2> ...
```

**禁止**: `git add -A` / `git add .` / `git add *`。
理由: untracked 全てを巻き込み、機密ファイル混入の事故源になる。
ファイル名を明示的に列挙する。

---

### Step 4 — コミットメッセージの提案と確認

`git log --oneline -5` で見たスタイルを踏襲しつつ、
Conventional Commits 風の構造で **Claude が提案** する：

```
<type>(<scope>): <50 文字以内の要約>

<空行>
<本文: なぜこの変更が必要か。何を解決するか。3〜5 行程度>
```

**type の選び方**：

| type | 用途 |
|---|---|
| feat | 新機能の追加 |
| fix | バグ修正 |
| docs | ドキュメントのみの変更 |
| refactor | 機能変化を伴わないコード改善 |
| test | テストの追加・修正 |
| chore | ビルド設定・依存関係・補助ツールなど |

**scope** はディレクトリ名や機能名（例: `exercise-3`, `slides`）。

ユーザーに以下の形式で提示して承認を得る：

```
コミットメッセージの提案：

  fix(exercise): settings.json の $schema URL に .json 拡張子を付与

  JSON Schema Store の正規 URL は .json 拡張子付き。リダイレクトに
  依存せず確実にスキーマ補完が効くようにする。

このメッセージでコミットしますか？（修正案があれば入力）
```

**HEREDOC でコミット**（複数行・日本語の改行を保つため）：

```bash
git commit -m "$(cat <<'EOF'
fix(exercise): settings.json の $schema URL に .json 拡張子を付与

JSON Schema Store の正規 URL は .json 拡張子付き。リダイレクトに
依存せず確実にスキーマ補完が効くようにする。
EOF
)"
```

複数コミットに分ける場合は Step 3 ② → Step 4 をコミット単位で繰り返す。

---

### Step 5 — プッシュ

```bash
git push origin <current-branch>
```

ブランチ名は `git branch --show-current` で取得して埋める。

**main への直接プッシュも許可**（このリポジトリの方針）。
ただし、push 直前に以下を画面に出してから実行する：

```
これから以下を push します：

  ブランチ: main → origin/main
  コミット: 2 件（git log origin/main..HEAD --oneline で確認可）

実行します。
```

**upstream が未設定の場合**（新規ブランチ等）：

```bash
git push -u origin <current-branch>
```

---

## 完了報告

push 成功後、以下の形式で報告する：

```
コミットしてプッシュしました。

  ブランチ: main
  コミット:
    - 6b900c8 fix(exercise): settings.json の $schema URL を修正
    - dae8ccb chore(skills): create-branch スキルを追加

リモート（origin/main）に反映済みです。
```

---

## トラブルシューティング

| 状況 | 対処 |
|---|---|
| `git push` が rejected（リモートが先行） | `git pull --rebase origin <branch>` を提案。コンフリクトが出たらユーザーに解消を依頼 |
| pre-commit hook が失敗 | hook の出力を読み、原因を直してから **新しいコミット** を作る（`--amend` は使わない） |
| 誤って機密ファイルをコミットしてしまった（push 前） | `git reset --soft HEAD~1` を提案し、ファイルを除外して再コミット |
| 誤って機密ファイルを push してしまった | ユーザーに即座に報告し、リモートのローテーション（鍵の再発行等）を促す。履歴書き換えは独断で行わない |
| `--amend` / `--no-verify` を使いたくなった | 原則使わない。新しいコミットを作るか、hook の問題を直す |

---

## 禁止事項

- `git add -A` / `git add .` / `git add *`（明示列挙する）
- `git commit --amend`（ユーザーが明示要求した場合のみ）
- `git commit --no-verify` / `--no-gpg-sign`（hook をスキップしない）
- `git push --force` / `--force-with-lease`（ユーザーが明示要求した場合のみ）
- `git config` の更新
