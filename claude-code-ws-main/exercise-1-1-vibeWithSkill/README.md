# [OPTIONAL] 体験①-1 Vibe × Skill — 同じ日報アプリを Skill 付きで作る

> **対応スライド**: 17–19（Skills）／ 11–13（Vibe との比較）
> **位置づけ**: 体験① の発展 — 当日のメニューには含まれない **オプション演習**
> **パラダイム**: Prompt → Context の間 — 「必要な知識パックを段階的に読み込ませる」感覚

## 学習目標

- Skill が **Vibe Coding をどう補強するか** を体感する
- `description` → `SKILL.md 本文` → `scripts` / `templates` の **段階的読込** を自分のセッションで観察する
- CLAUDE.md と Skill の違い（常時読込 vs オンデマンド読込）を実感する

## お題

**フロントエンド UI 系の Skill をインストールしてから、同じ日報アプリ（Next.js）を作る。**

体験① と同じ一言で始めますが、Skill が入っている状態で何が変わるかを観察します。

---

## 事前準備: Skill の追加

Claude Code の Skill は、**Plugin 経由で配布** されるのが一般的です。

```bash
# Claude Code を起動してから、スラッシュコマンドで実行
/plugin marketplace add <owner>/<marketplace-repo>
/plugin install <skill-or-plugin-name>
```

> 最新の書式は公式ドキュメント（https://docs.claude.com/claude-code）を確認してください。Claude Code は毎週アップデートされるため、コマンドオプションが変わる可能性があります。

### DIG 社内 marketplace を使う場合

講師から配布される URL を `<owner>/<marketplace-repo>` に入れてください。例：

```bash
/plugin marketplace add tmc-ccoe/dig-plugin-market
/plugin install <skill-name>@dig-plugin-market
```

### 公開 Plugin で試す場合

`awesome-claude-code` 等で探してみてください。実行可能な Skill が一般公開されています。

---

## 進め方（30 分）

Skill インストール後、Claude Code で体験① と同じ一言プロンプトから始めます。

```text
Next.js で日報アプリを作って。
名前と今日やったことを入力して、一覧表示できるようにして。
```

| 時間 | やること | 観察 |
|---|---|---|
| 0–5 min | 上のプロンプトを投げて、動くものを作る | Skill が発火する瞬間（どのタイミングで呼ばれた？） |
| 5–15 min | 「見た目をきれいにして」「日付で絞り込み」「カテゴリ分け」 | 体験① より UI の質が安定しているか？ |
| 15–25 min | 「グラフで投稿数の推移」「ダークモード対応」 | 大きな変更で Skill が再利用されるか？ |
| 25–30 min | 振り返りメモ（下） | 体験① との差分を言語化 |

---

## 振り返りメモ

```text
### Skill あり vs 素の Vibe
- 初動の質（見た目・構造）:
- Skill が発火した瞬間（何を言ったら呼ばれた？）:
- 同じプロンプトで結果の揺れは減った？:

### 段階的読込の観察
- description だけの時と SKILL.md 本文が読み込まれた時で挙動は変わった？:
- コンテキスト消費の体感（/context などで確認）:

### チーム開発で使えそう？
- Skill を共有すれば品質が揃いそう？:
```

---

## ポイント（スライド 17–19 と対応）

| スライド | 観察点 |
|---|---|
| 17 | description → 本文 → scripts の **段階的読込** が実際に起こるか |
| 18 | SKILL.md の **YAML Front Matter + Markdown 本文** 2 部構成 |
| 19 | `description` の 4 原則（What + When + NOT 条件 + 三人称）が発火精度に効いているか |

---

## 注意

- **体験①-1 は任意**。本筋は体験② に進むことです
- Skill が発火しないときは、使われた description を `/agents` 等で確認し、発火条件（トリガー）を見直してください
- 公式書式は毎週変わる可能性あり — エラーが出たら公式ドキュメントをまず確認

## 関連資料

- [`../docs/materials/ch04-skills-agents-mcp.md`](../docs/materials/ch04-skills-agents-mcp.md) — Skills / Agents / MCP 講義資料
