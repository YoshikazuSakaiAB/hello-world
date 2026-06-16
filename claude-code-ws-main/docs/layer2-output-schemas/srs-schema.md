# SRS（ソフトウェア要求仕様）出力スキーマ

## 目的

StRS の要求を **実装可能な粒度** に分解し、Epic → Feature → UserStory の 3 階層で構造化する。

## 入力ソース

- StRS（`REQ-NNN`）
- ビジネス要件・制約（`context-repo/requirements/`）
- ユーザージャーニー（`context-repo/journeys/`）

## 必須構造（3 階層）

```
Epic (EPIC-NNN)
  ├── Feature (FEAT-NNN)
  │     ├── UserStory (US-NNN)
  │     └── UserStory (US-NNN)
  └── Feature (FEAT-NNN)
        └── UserStory (US-NNN)
```

### Epic の必須項目

| 項目 | 内容 |
|---|---|
| `id` | `EPIC-NNN` |
| `title` | Epic タイトル |
| `source_requirements` | 関連する `REQ-NNN` 配列 |
| `goal` | 解決したい課題 / 得たい成果 |
| `priority` | MoSCoW |

### Feature の必須項目

| 項目 | 内容 |
|---|---|
| `id` | `FEAT-NNN` |
| `parent_epic` | `EPIC-NNN` |
| `title` | Feature タイトル |
| `description` | 1〜3 文の説明 |

### UserStory の必須項目

| 項目 | 内容 |
|---|---|
| `id` | `US-NNN` |
| `parent_feature` | `FEAT-NNN` |
| `narrative` | `As a <role>, I want <goal>, so that <benefit>` |
| `acceptance_criteria` | **Given / When / Then 形式必須** |
| `priority` | MoSCoW |
| `estimate` | 見積もり（任意） |

## 品質基準

- [ ] すべての UserStory が Given / When / Then の受入基準を持つ
- [ ] すべての Epic が 1 つ以上の `REQ-NNN` を参照している
- [ ] すべての Feature が親 Epic を持つ
- [ ] すべての UserStory が親 Feature を持つ
- [ ] `Must` 要求は少なくとも 1 つの Epic にマッピングされている
- [ ] User Story narrative が `As a / I want / so that` 形式に準拠している

## トレーサビリティ

- **上流**: StRS の `REQ-NNN`
- **下流**: テスト定義（`TC-NNN` が `US-NNN` を参照）、実装（コミットメッセージに `US-NNN` を含める）

## 出力例

```markdown
# SRS-001 日報管理システム 仕様書

## EPIC-001 日報提出フロー

- **Source Requirements**: REQ-001, REQ-003
- **Goal**: 全社員が毎日の業務内容を記録・提出できる
- **Priority**: Must

### FEAT-001 日報の作成・保存

日報を作成し、本文・日付を含めて保存できる。

#### US-001 日報を新規作成する

- **Narrative**: As a 一般社員, I want 当日分の日報を作成したい, so that 上長に業務を報告できる
- **Priority**: Must
- **Acceptance Criteria**:
  - **Given** ログイン済みの一般社員が日報作成画面にいる
    **When** 本文を入力して保存ボタンを押す
    **Then** 日報が保存され、一覧に表示される
  - **Given** 本文が空
    **When** 保存ボタンを押す
    **Then** バリデーションエラーが表示され、保存されない
  - **Given** 同日の日報が既に存在する
    **When** 再度作成を試みる
    **Then** 「既に提出済みです」と表示される

#### US-002 日報を一覧で閲覧する
...
```
