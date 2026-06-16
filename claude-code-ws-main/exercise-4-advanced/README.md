# 体験④ TDD Guard 再実装（Day2 必修）

> **対応スライド**: 38–42（体験④）／ 39（Plugin 開発）／ 41（自己学習ループ）／ 45（注目 Plugin）
> **進行章**: Day2 第 9 章 / **55 分**（v2 で Appendix から本編必修に格上げ）
> **パラダイム**: Harness Engineering — Skills + Hooks + Plugin で人気プラグインの核心を再実装

## お題

**Superpowers（143K ⭐）の「TDD 強制」を Skills + Hooks で再実装する**

> テストを書く前にコードを書いたら自動ブロック。外部ライブラリ不要、`SKILL.md` + `settings.json` + シェルスクリプトだけ。

## 学習目標

- `description` で Skill の発火条件を設計する（スライド 19）
- `PreToolUse` Hook で **物理的に** ルールを強制する（スライド 28 / 48）
- Skills + Hooks + Plugin の組み合わせで、人気 Plugin の核心を自分の手で書けることを実感
- **自己学習ループ**（Plan → Generate → Evaluate）の入口を知る（スライド 41）

---

## 事前準備

体験③ の成果物をこのディレクトリにコピー（**`__tests__/` と `.claude/` も含める**）。

```bash
cp -r ../exercise-3-agentic/src ./src
cp -r ../exercise-3-agentic/__tests__ ./__tests__
cp -r ../exercise-3-agentic/specs ./specs
cp ../exercise-3-agentic/CLAUDE.md ./CLAUDE.md
cp ../exercise-3-agentic/package.json ./package.json
cp ../exercise-3-agentic/package-lock.json ./package-lock.json 2>/dev/null || true
cp ../exercise-3-agentic/vite.config.ts ./vite.config.ts 2>/dev/null || true
cp ../exercise-3-agentic/tsconfig.json ./tsconfig.json 2>/dev/null || true
npm install
```

このディレクトリには **以下の雛形が既に入っています**。

```
.
├── .claude/
│   └── settings.json                          ← Step 2 で編集（Hooks 登録）
├── .claude-plugin/
│   └── plugin.json                            ← Step 4 で編集（Plugin 化）
├── tdd-guard/
│   ├── SKILL.md                               ← Step 1 で確認
│   └── scripts/
│       ├── check-test-exists.sh               ← Step 2 で完成させる（TODO 付き）
│       └── check-test-exists.sample.sh        ← 完成例（困ったら参照）
├── templates/
│   └── plugin-json-template.json              ← Step 4 の参考
└── README.md                                  ← このファイル
```

---

## 進め方（55 分）

| 時間 | Step | やること | スライド |
|---|---|---|---|
| 0–5 min | ① | SKILL.md を読む | 19 |
| 5–20 min | ② | `check-test-exists.sh` を完成させる | 28 / 42 |
| 20–30 min | ③ | 動作確認（ブロック / 許可の 2 シナリオ） | 48 |
| 30–45 min | ④ | Plugin 化 | 39 |
| 45–50 min | ⑤ | 振り返り & 自己学習ループの紹介 | 41 |

---

## Step 1: SKILL.md を読む（5 分）

`tdd-guard/SKILL.md` を開いて中身を確認します。

```bash
cat tdd-guard/SKILL.md
```

注目ポイント：

- `description` が **三人称** + **When** + **NOT 条件** の 3 要素を含んでいる
- 日本語と英語のトリガーワードを両方列挙している
- 「何をする Skill か」「使わない場面はどこか」が明確

自分の好みで `description` を書き換えて発火条件の実験をしてみても OK。

## Step 2: `check-test-exists.sh` を完成させる（15 分）

`tdd-guard/scripts/check-test-exists.sh` に TODO が残っています。中身を完成させてください。

### 仕様

このスクリプトは `PreToolUse(Write|Edit)` Hook として動き、以下を行います：

1. stdin から JSON を受け取り、書き込み先のファイルパスを取得
2. そのファイルに対応するテストファイルが存在するか確認
3. テストがなければ **`exit 2`**（ブロック）、あれば **`exit 0`**（許可）

### Hook 登録

`.claude/settings.json` を次のように更新します（雛形は既に配置済み）：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "bash tdd-guard/scripts/check-test-exists.sh" }
        ]
      }
    ]
  }
}
```

### 詰まった場合

- `check-test-exists.sh` の TODO にはヒントがコメントで書かれています
- それでも詰まったら `check-test-exists.sample.sh` を参照（**写経用の最後の手段**）

## Step 3: 動作確認（10 分）

2 つのシナリオで挙動を確認します。

### シナリオ①: ブロックされるケース

Claude Code に以下を頼みます：

```text
src/components/NewFeature.tsx を作って、ボタンを 1 つ配置してください。
```

→ `PreToolUse` Hook が発火し、`__tests__/components/NewFeature.test.tsx` が無いのでブロック。AI にエラーメッセージが返り、次のターンで **AI が自発的に** 「先にテストを書きます」と方針転換します。

### シナリオ②: 許可されるケース

```text
まず __tests__/components/NewFeature.test.tsx を先に書いてください。
次に src/components/NewFeature.tsx を実装してください。
```

→ テストファイルの Write はスキップ条件にマッチして許可 → 実装側も許可。

### 観察ポイント

- AI が自動で方針転換する挙動
- エラーメッセージが **コンテキストに戻る** 仕組み
- CLAUDE.md に書くだけでは得られない「物理的に止まる」感覚（スライド 48）

## Step 4: Plugin 化（15 分）

`.claude-plugin/plugin.json` を開いて、以下のように更新します。雛形は既に配置済み。

```json
{
  "name": "tdd-guard",
  "version": "1.0.0",
  "description": "TDD を強制する品質ゲート Plugin。テストなしのコード編集をブロックする。",
  "author": "あなたの名前",
  "homepage": "https://github.com/あなたのアカウント/tdd-guard",
  "hooks": ".claude/settings.json#hooks",
  "skills": ["tdd-guard/SKILL.md"]
}
```

### チームメンバー側のインストール手順

```bash
# 参加者が自分のリポジトリに push しておく
git push origin main

# チームメンバー（別端末）で
/plugin marketplace add <あなたのGitHubユーザー>/<リポジトリ名>
/plugin install tdd-guard@<マーケットプレース名>
```

### 組織展開のポイント（スライド 39）

```
1. 開発:     個人で SKILL.md + Hook を書く
2. 公開:     GitHub にプッシュ
3. インストール: claude plugin add で配布
4. 運用:     claude plugin update で全員に更新が行き渡る
```

## Step 5: 振り返り & 自己学習ループ（5 分）

### 振り返りメモ

```text
### 体験④ で身についたこと
- description の設計で気づいたこと:
- exit 2 の効き目:
- Plugin 化で広がった視界:

### 体験③ との違い
- CLAUDE.md で書くだけのルール vs Hooks で強制するルール:
- 何を CLAUDE.md に置き、何を Hooks に置くか:
```

### 自己学習ループの紹介（スライド 41）

```
Plan → Generate → Evaluate → (不合格なら Plan へ戻る)
```

**今日作った TDD Guard に、さらに `Stop Hook` で CLAUDE.md を自動更新する仕組みを足せば、自己学習ループの最小構成になります**。

| 原則 | 実装 |
|---|---|
| 目標を高く設定 | Evaluate の採点基準を厳しくする |
| ループ上限を決める | `maxTurns` で無限ループ防止 |
| 差分だけ修正 | Evaluate で指摘された箇所だけを修正 |

---

## 完成イメージ

```
exercise-4-advanced/
├── .claude/
│   └── settings.json            ← Step 2 で PreToolUse を登録
├── .claude-plugin/
│   └── plugin.json              ← Step 4 で Plugin メタ情報
├── tdd-guard/
│   ├── SKILL.md                 ← Step 1 で確認
│   └── scripts/
│       ├── check-test-exists.sh         ← Step 2 で完成させた
│       └── check-test-exists.sample.sh  ← 完成例
├── templates/
│   └── plugin-json-template.json
├── src/, __tests__/, specs/     ← 体験③ からコピー
├── CLAUDE.md                    ← 体験③ からコピー
└── README.md                    ← このファイル
```

## 関連資料

- [`../docs/materials/ch09-exercise4-tdd-guard.md`](../docs/materials/ch09-exercise4-tdd-guard.md) — 体験④ 講義資料
- [`../docs/materials/ch11-three-layer-standard.md`](../docs/materials/ch11-three-layer-standard.md) — スケール編（3 層スタンダード / Plugin 化の位置づけ）
