# テスト定義出力スキーマ

## 目的

SRS の UserStory から、アクセプタンステスト・ユニットテストを **網羅的に** 自動生成するための型定義。

## 入力ソース

- SRS の UserStory（`US-NNN`）
- UserStory の Acceptance Criteria（Given / When / Then）
- アーキテクチャ（どのコンポーネントをテストするか）

## 必須構造

```
Feature (FEAT-NNN)
  └── Scenario (SCEN-NNN)
        └── Given / When / Then
```

### Feature の必須項目

| 項目 | 内容 |
|---|---|
| `id` | `FEAT-NNN`（SRS の Feature ID を再利用） |
| `title` | Feature タイトル |
| `source_user_stories` | 関連する `US-NNN` 配列 |

### Scenario の必須項目

| 項目 | 内容 |
|---|---|
| `id` | `SCEN-NNN` |
| `parent_feature` | `FEAT-NNN` |
| `source_user_story` | `US-NNN` |
| `type` | `happy-path` / `error-case` / `boundary` |
| `description` | 1 行の要約 |
| `steps` | Given / When / Then の配列 |

## 必須パターン（3 種類）

各 UserStory に対し以下 3 パターンを **必ず** 定義する：

| パターン | 説明 | 例 |
|---|---|---|
| **正常系**（happy-path） | 仕様通りの動作 | 正しい入力で保存できる |
| **異常系**（error-case） | エラー・失敗の扱い | バリデーションエラー、権限なし |
| **境界値**（boundary） | 境界条件の扱い | 0 文字 / 最大長 / 重複など |

## 品質基準

- [ ] 各 Feature が少なくとも 1 つの Scenario を持つ
- [ ] 各 UserStory に対し 3 パターン（正常系・異常系・境界値）すべてのテストが存在
- [ ] 各 Scenario が Given / When / Then を 1 つ以上ずつ持つ
- [ ] `source_user_story` が実在する `US-NNN` を指している
- [ ] Scenario の `type` が定義された 3 種類のいずれか

## トレーサビリティ

- **上流**: SRS UserStory
- **下流**: テストコード（ファイル冒頭コメントに `SCEN-NNN` を記載）、カバレッジレポート

## 出力例（Gherkin 形式）

```gherkin
Feature: FEAT-001 日報の作成・保存
  Source User Stories: US-001

  # SCEN-001: 正常系
  Scenario: 一般社員が本文を入力して日報を保存する
    Given ログイン済みの一般社員が日報作成画面にいる
    And 本日分の日報はまだ作成されていない
    When 本文に "本日は機能 A を実装" と入力して保存ボタンを押す
    Then 日報が保存される
    And 一覧画面で本日分が表示される

  # SCEN-002: 異常系
  Scenario: 本文が空のまま保存しようとする
    Given ログイン済みの一般社員が日報作成画面にいる
    When 本文が空のまま保存ボタンを押す
    Then "本文を入力してください" と表示される
    And 日報は保存されない

  # SCEN-003: 境界値（重複）
  Scenario: 同日の日報を二重に作成しようとする
    Given 本日分の日報が既に存在する
    When 再度作成を試みる
    Then "既に提出済みです" と表示される
```
