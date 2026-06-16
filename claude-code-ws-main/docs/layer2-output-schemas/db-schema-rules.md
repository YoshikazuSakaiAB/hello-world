# DB スキーマ生成ルール

## 目的

SRS とアーキテクチャから、DB スキーマ（例: Prisma / SQL DDL）を自動生成する際の **命名規則・型制約・必須要素** を定義する。

## 入力ソース

- SRS の Feature / UserStory（必要なデータ項目を抽出）
- アーキテクチャの Container（DB 選定）
- 非機能要件（性能・監査要件）

## 必須要素

生成される DB スキーマは以下を含む：

| 要素 | 説明 |
|---|---|
| **モデル（テーブル）** | SRS のドメインエンティティごとに 1 モデル |
| **リレーション** | 外部キー・参照整合性を明示 |
| **インデックス** | クエリパターンに基づき定義 |
| **列挙型（enum）** | 状態・区分は文字列ではなく enum |
| **監査カラム** | `createdAt` / `updatedAt` / `createdBy` / `updatedBy` |

## 命名規則

| 対象 | ルール | 例 |
|---|---|---|
| テーブル / モデル名 | PascalCase 単数形 | `User`, `DailyReport` |
| カラム名 | camelCase | `createdAt`, `userId` |
| 外部キー | `<参照先>Id` | `userId` → `User.id` |
| インデックス | `idx_<table>_<columns>` | `idx_daily_report_user_id_date` |
| enum 名 | PascalCase | `ReportStatus` |
| enum 値 | SCREAMING_SNAKE_CASE | `DRAFT`, `SUBMITTED` |

## 型制約

- 主キーは UUID（v4 または v7）または BIGINT 自動採番
- 文字列は最大長を明示（`VARCHAR(n)` / Prisma の `@db.VarChar(n)`）
- 金額は `DECIMAL` または整数（通貨最小単位）
- タイムスタンプは UTC で保存、TZ はアプリ層で変換
- `NULL` 許容は明示的に判断（デフォルトは `NOT NULL`）

## 監査カラム（必須）

すべてのテーブルに以下を含める：

| カラム | 型 | デフォルト | 備考 |
|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | 主キー |
| `createdAt` | `TIMESTAMPTZ` | `now()` | 作成日時 |
| `updatedAt` | `TIMESTAMPTZ` | `now()` | 更新時に自動更新 |
| `createdBy` | UUID | — | 作成者 User ID（任意） |
| `updatedBy` | UUID | — | 更新者 User ID（任意） |

論理削除を採用する場合：`deletedAt TIMESTAMPTZ NULL`

## 品質基準

- [ ] すべてのテーブルに主キーと監査カラムがある
- [ ] すべての外部キーに参照整合性制約がある
- [ ] 頻出クエリ（SRS から抽出）に対応するインデックスがある
- [ ] 状態・区分値は文字列ではなく enum で定義されている
- [ ] 命名規則に違反しているカラム・テーブルがない
- [ ] マイグレーションファイルが生成されている（履歴を Git で追える）

## トレーサビリティ

- **上流**: SRS Feature / UserStory の必要データ、非機能要件
- **下流**: マイグレーションファイル、ORM モデル、Repository 層

## 出力例（Prisma）

```prisma
model User {
  id        String   @id @default(uuid()) @db.Uuid
  email     String   @unique @db.VarChar(255)
  name      String   @db.VarChar(100)
  role      UserRole

  reports   DailyReport[]

  createdAt DateTime @default(now()) @db.Timestamptz
  updatedAt DateTime @updatedAt @db.Timestamptz

  @@map("users")
}

model DailyReport {
  id        String       @id @default(uuid()) @db.Uuid
  userId    String       @db.Uuid
  reportDate DateTime    @db.Date
  body      String       @db.Text
  status    ReportStatus @default(DRAFT)

  user      User         @relation(fields: [userId], references: [id])

  createdAt DateTime     @default(now()) @db.Timestamptz
  updatedAt DateTime     @updatedAt @db.Timestamptz

  @@unique([userId, reportDate])
  @@index([userId, reportDate], name: "idx_daily_report_user_id_date")
  @@map("daily_reports")
}

enum UserRole {
  EMPLOYEE
  MANAGER
  ADMIN
}

enum ReportStatus {
  DRAFT
  SUBMITTED
}
```
