# 【開発標準】power.config.json編集時のJSON構文検証必須化

## 🐛 問題の概要

Power Apps Code Appsプロジェクトにおいて、`power.config.json`のJSON構文エラーが原因で、ランタイムでDataverse接続が完全に失敗する重大な問題が発生しました。

## 📋 発生した症状

### エラーメッセージ
```
Data source not found: Failed to load Dataverse database references from runtime
```

### 影響範囲
- ✗ すべてのDataverse CRUD操作が失敗（create, read, update, delete）
- ✗ `getAll()`, `create()`, `update()`, `delete()` すべてのサービスメソッドが動作不可
- ✗ デプロイされたアプリケーションが完全に使用不能
- ✗ TypeScriptコンパイルは成功するため、ビルド時にエラー検出不可

### 特徴
- ローカルビルド（`npm run build`）は成功する
- TypeScriptの型チェックでもエラーが出ない
- デプロイ（`pac code push`）も成功する
- **ブラウザでアプリを起動した時のみエラーが発生**

## 🔍 根本原因

### 問題箇所
`power.config.json`の`connectionReferences`セクション内で、**閉じ括弧が不足**していました。

### エラーコード例
```json
{
  "connectionReferences": {
    "846dbf69-cd8b-4997-9b17-7629a1654674": {
      "id": "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps",
      "displayName": "Microsoft Dataverse",
      "dataSources": [
        "geek_businessprocesses"
      ],
      "dataSets": {
        "unqf7a0f9bc714af011be5200224806e": {
          "tables": [
            "geek_businessprocesses"
          ]
        }  // ❌ ここで閉じ括弧が不足
      // ❌ dataSetsの閉じ括弧 "}" が必要
    // ❌ connectionReferenceの閉じ括弧 "}" が必要
  },
  "databaseReferences": {
    // ...
  }
}
```

### 正しいコード
```json
{
  "connectionReferences": {
    "846dbf69-cd8b-4997-9b17-7629a1654674": {
      "id": "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps",
      "displayName": "Microsoft Dataverse",
      "dataSources": [
        "geek_businessprocesses"
      ],
      "dataSets": {
        "unqf7a0f9bc714af011be5200224806e": {
          "tables": [
            "geek_businessprocesses"
          ]
        }
      }  // ✅ dataSetsの閉じ括弧
    }    // ✅ connectionReferenceの閉じ括弧
  },     // ✅ connectionReferencesの閉じ括弧
  "databaseReferences": {
    // ...
  }
}
```

### なぜ気づきにくいのか
1. **TypeScriptはJSONファイルをチェックしない** - `npm run build`でエラーが出ない
2. **デプロイツールもJSONパースを検証しない** - `pac code push`が成功する
3. **エラーメッセージが誤解を招く** - 「Data source not found」と表示され、構文エラーとは思えない
4. **ランタイムでのみ問題が発生** - ブラウザで実行するまでエラーが分からない

## ✅ 解決方法

### 1. JSON構文検証ツールを使用
以下のいずれかの方法でJSON構文を検証：

- **VS Codeエディタ**: ファイルを開いて構文エラーの赤い波線を確認
- **オンラインツール**: [jsonlint.com](https://jsonlint.com/) または [jsonformatter.org](https://jsonformatter.org/)
- **コマンドライン**: `python -m json.tool power.config.json` または `node -e "JSON.parse(require('fs').readFileSync('power.config.json'))"`

### 2. 正しい括弧の数を確認
```json
{                    // 1
  "connectionReferences": {  // 2
    "id-here": {             // 3
      "dataSets": {          // 4
        "dataset-id": {      // 5
          "tables": []
        }                    // 5を閉じる
      }                      // 4を閉じる
    }                        // 3を閉じる
  },                         // 2を閉じる
  "databaseReferences": {}
}                    // 1を閉じる
```

### 3. 修正後の確認手順
```bash
# 1. JSON構文をチェック
# VS Codeでpower.config.jsonを開いてエラーがないことを確認

# 2. ビルド
npm run build

# 3. デプロイ
pac code push

# 4. ブラウザで強制リロード
# Ctrl + Shift + R (Windows/Linux)
# Cmd + Shift + R (Mac)
```

## 🛡️ 再発防止策

### 開発標準として採用すべきルール

#### ✅ 必須: power.config.json編集時のJSON検証
`power.config.json`を手動編集する場合は、**必ずJSON構文検証を実施すること**

- [ ] VS Codeで構文エラーの波線がないことを確認
- [ ] オンライン検証ツールでチェック
- [ ] プルリクエストレビュー時にJSON構文を確認

#### ✅ 推奨: pac codeコマンドの使用
データソース追加は、可能な限り`pac code add-data-source`コマンドを使用すること

```bash
pac code add-data-source -a "shared_commondataserviceforapps" -c "<connection-id>" -t "<table-name>" -d "<dataset-name>"
```

**理由**:
- 正しいJSON構造が自動生成される
- 手動編集による構文エラーを防止
- 必要なスキーマファイルも同時生成

#### ✅ 推奨: 自動生成ファイルの保護
以下のファイルは、自動生成されたものとして扱い、手動編集を最小限にすること

- `power.config.json`
- `.power/schemas/appschemas/dataSourcesInfo.ts`
- `src/generated/services/*Service.ts`
- `src/generated/models/*Model.ts`

手動編集が必要な場合は：
1. バックアップを取る
2. JSON検証を必ず行う
3. コードレビューで構文チェック

#### ✅ 推奨: デプロイ前チェックリスト
```markdown
- [ ] `npm run build` でビルド成功を確認
- [ ] power.config.json の JSON構文に問題がないことを確認
- [ ] 生成されたサービスが正しくインポートされているか確認
- [ ] `pac code push` でデプロイ実行
- [ ] ブラウザで Ctrl+Shift+R で強制リロード
- [ ] Dataverse CRUD操作が正常に動作するか確認
```

## 📚 参考資料

- [DATAVERSE_BEST_PRACTICES.md](../DATAVERSE_BEST_PRACTICES.md) - Dataverse統合のベストプラクティス
- [Power Apps Code Apps Documentation](https://learn.microsoft.com/power-apps/developer/code-apps/)
- [pac code CLI Reference](https://learn.microsoft.com/power-platform/developer/cli/reference/code)

## 🏷️ ラベル

- `severity: critical` - アプリケーション全体が使用不能になる
- `type: bug` - 構文エラー
- `area: configuration` - power.config.json
- `area: dataverse` - Dataverse統合
- `status: resolved` - 解決済み
- `topic: standards` - 開発標準化

## 📅 タイムライン

- **発生日**: 2026年2月5日
- **解決日**: 2026年2月5日
- **影響期間**: デプロイから解決まで（Dataverse操作が完全に不可）
- **再発リスク**: 中（手動編集時に再発の可能性あり）

---

## ✍️ 開発チームへのアクション

- [ ] この問題をチーム全体に共有
- [ ] `power.config.json` 編集時のJSON検証を開発標準に追加
- [ ] プルリクエストレビューチェックリストに「JSON構文検証」を追加
- [ ] VS Code拡張機能でJSON検証を強化（可能であれば）
- [ ] CI/CDパイプラインにJSON構文検証ステップを追加（検討）
