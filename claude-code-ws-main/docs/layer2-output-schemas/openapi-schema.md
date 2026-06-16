# OpenAPI 仕様書生成ルール

## 目的

SRS とアーキテクチャから、OpenAPI（3.1）仕様書を自動生成するためのルール。
API 契約を中央に置き、フロントエンド・バックエンド・テストを整合させる。

## 入力ソース

- SRS の UserStory（エンドポイントの必要性）
- アーキテクチャの Container / Component（API 境界）
- DB スキーマ（リソース構造）

## 必須要素

| 要素 | 説明 |
|---|---|
| `info` | title / version / description / contact |
| `servers` | 環境ごとの URL（dev / staging / prod） |
| `paths` | エンドポイント定義 |
| `components.schemas` | リクエスト / レスポンスの型定義 |
| `components.securitySchemes` | 認証方式 |
| `tags` | リソース単位でグルーピング |

## エンドポイント設計ルール

- URL はリソース名の **複数形** の名詞（`/reports`、`/users`）
- 階層は 2 段まで（`/users/{userId}/reports`）
- 動作は HTTP メソッドで表現（`GET / POST / PUT / PATCH / DELETE`）
- ステータスコード:
  - `200 OK` / `201 Created` / `204 No Content`
  - `400 Bad Request`（バリデーション） / `401` / `403` / `404` / `409`（競合）
  - `5xx` はサーバエラー
- エラーレスポンスは統一フォーマット（例: `Problem Details for HTTP APIs` RFC 9457）

## 命名規則

| 対象 | ルール | 例 |
|---|---|---|
| パス | kebab-case の複数形 | `/daily-reports` |
| パスパラメータ | camelCase | `/daily-reports/{reportId}` |
| クエリ | camelCase | `?userId=...&limit=...` |
| JSON キー | camelCase | `"createdAt": "..."` |
| スキーマ名 | PascalCase | `DailyReportResponse` |

## 必須項目

- すべてのエンドポイントに `summary` / `description` / `tags` / `operationId`
- すべてのレスポンスに `description` と `content.application/json.schema`
- すべてのエラーパスに `4xx` / `5xx` のレスポンス定義
- `requestBody` はスキーマ参照必須（インラインは最小限）
- `security` が定義されている（`public` なエンドポイントは明示的に `security: []`）

## 品質基準

- [ ] OpenAPI linter（例: Spectral）でエラーゼロ
- [ ] すべてのパスに `operationId` が一意に付与されている
- [ ] すべてのスキーマに `description` がある
- [ ] エラーレスポンスが統一フォーマット
- [ ] SRS の UserStory すべてに対応するエンドポイントが存在
- [ ] 破壊的変更は `info.version` の major 更新 + 変更ログ記載

## トレーサビリティ

- **上流**: SRS UserStory、アーキテクチャ
- **下流**: フロント側の型生成、バックエンドのハンドラ、API テスト、SDK 生成

## 出力例（抜粋）

```yaml
openapi: 3.1.0
info:
  title: 日報管理 API
  version: 1.0.0
  description: |
    日報の作成・閲覧・検索を提供する。
    Source SRS: SRS-001

servers:
  - url: https://api.example.com/v1
    description: production

tags:
  - name: reports
    description: 日報

security:
  - bearerAuth: []

paths:
  /daily-reports:
    post:
      tags: [reports]
      operationId: createDailyReport
      summary: 日報を作成する
      description: Source US-001
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateDailyReportRequest"
      responses:
        "201":
          description: 作成成功
          content:
            application/json:
              schema: { $ref: "#/components/schemas/DailyReportResponse" }
        "400":
          $ref: "#/components/responses/BadRequest"
        "409":
          description: 同日分が既に存在
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Problem" }

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    CreateDailyReportRequest:
      type: object
      required: [body, reportDate]
      properties:
        body: { type: string, minLength: 1, maxLength: 5000 }
        reportDate: { type: string, format: date }
    DailyReportResponse:
      type: object
      properties:
        id: { type: string, format: uuid }
        body: { type: string }
        reportDate: { type: string, format: date }
        createdAt: { type: string, format: date-time }
    Problem:
      type: object
      description: RFC 9457 Problem Details
      properties:
        type: { type: string, format: uri }
        title: { type: string }
        status: { type: integer }
        detail: { type: string }

  responses:
    BadRequest:
      description: リクエスト不正
      content:
        application/json:
          schema: { $ref: "#/components/schemas/Problem" }
```
