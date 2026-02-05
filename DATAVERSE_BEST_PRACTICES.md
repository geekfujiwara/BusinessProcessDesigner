# Power Apps Code Apps - Dataverse統合ベストプラクティス

## 概要
このドキュメントは、Power Apps Code Apps (pac code)でDataverseを統合する際のベストプラクティスと、よくあるトラブルシューティング手順をまとめたものです。

---

## 重要な修正事例: power.config.jsonのJSON構文エラー

### 問題の概要
Dataverseへの接続時に以下のエラーが発生：
```
Data source not found: Failed to load Dataverse database references from runtime
```

すべてのCRUD操作（create、read、update、delete）が失敗し、ランタイムでデータベース参照を読み込めない状態でした。

### 根本原因
**power.config.jsonのJSON構文エラー**

`connectionReferences`セクション内の`dataSets`の後で、閉じ括弧が不足していました。これにより、Power Appsランタイムが設定ファイルを正しくパースできず、Dataverse接続が初期化されませんでした。

### 誤った構文例（エラーが発生）
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
        }  // ← ここで閉じ括弧が不足
      // ← ここに "}" が必要
    // ← ここに "}" が必要
  },
  "databaseReferences": {
    // ...
  }
}
```

### 正しい構文（修正後）
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
      }  // ← dataSetsの閉じ括弧
    }    // ← connectionReferenceの閉じ括弧
  },     // ← connectionReferencesの閉じ括弧
  "databaseReferences": {
    // ...
  }
}
```

### 修正手順
1. power.config.jsonをJSON検証ツールでチェック（VS Codeのエディタやjsonlint.comなど）
2. `dataSets`オブジェクトの後に`}`を追加
3. connectionReference全体の後に`}`を追加
4. `connectionReferences`オブジェクト全体の後に`}`を追加
5. ファイルを保存
6. ビルドとデプロイを実行：
   ```bash
   npm run build
   pac code push
   ```

### 学んだ教訓
- **JSON構文エラーは静かに失敗する**: TypeScriptのコンパイルエラーと異なり、JSONの構文エラーは開発時には検出されず、ランタイムでのみ問題が発生する
- **エラーメッセージが誤解を招く**: 実際の問題はJSON構文エラーなのに、「Data source not found」や「Failed to load database references」といったメッセージが表示される
- **手動編集時の注意**: power.config.jsonを手動で編集する際は、必ずJSON検証を行う

---

## ベストプラクティス

### 1. pac code add-data-sourceを使用する
データソースの追加は、**必ず`pac code add-data-source`コマンドを使用**してください。これにより、power.config.jsonと必要なスキーマファイルが自動生成されます。

```bash
# Dataverseテーブルを追加
pac code add-data-source -a "shared_commondataserviceforapps" -c "<connection-id>" -t "<table-name>" -d "<dataset-name>"
```

**理由**:
- 正しいJSON構造が保証される
- 必要なスキーマファイル（.power/schemas/appschemas/dataSourcesInfo.ts）が自動生成される
- サービスクラス（src/generated/services/）が自動生成される

### 2. 自動生成されたファイルを改変しない
`pac code add-data-source`で生成されたファイルは、可能な限り改変しないでください：

- `power.config.json`の`connectionReferences`と`databaseReferences`
- `.power/schemas/appschemas/dataSourcesInfo.ts`
- `src/generated/services/*Service.ts`
- `src/generated/models/*Model.ts`

**理由**:
- 手動編集により構文エラーが混入するリスク
- 将来のpac codeコマンド実行時に競合が発生する可能性
- Power Appsランタイムが期待する形式と異なる可能性

### 3. 生成されたサービスを使用する
Dataverse操作には、必ず生成されたサービスクラスを使用してください。

```typescript
// ✅ 推奨: 生成されたサービスを使用
import { Geek_businessprocessesService } from '@/generated/services/Geek_businessprocessesService';

const processes = await Geek_businessprocessesService.getAll({
  select: ['geek_processname', 'geek_description'],
  orderBy: { geek_createdon: 'desc' }
});

// ❌ 非推奨: 直接APIを呼び出す
// 自作のサービスクラスを作成することは避ける
```

### 4. JSON構文検証を必ず行う
power.config.jsonを手動で編集した場合は、**必ずJSON構文検証を実行**してください。

**検証方法**:
1. VS Code上でpower.config.jsonを開き、エディタ右下に「JSON」と表示されていることを確認
2. 構文エラーがある場合は赤い波線が表示される
3. オンラインツール（jsonlint.com、jsonformatter.org）でも検証可能

### 5. デプロイ前のビルド確認
デプロイ前に必ずローカルビルドが成功することを確認してください。

```bash
npm run build
```

TypeScriptエラーやViteビルドエラーがないことを確認してから、デプロイを実行します。

```bash
pac code push
```

### 6. ブラウザキャッシュのクリア
デプロイ後に変更が反映されない場合は、**ブラウザの強制リロード**を実行してください。

- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

または、ブラウザの開発者ツールから「キャッシュの消去とハードリロード」を実行します。

---

## トラブルシューティング

### "Failed to load Dataverse database references from runtime" エラー

**チェックリスト**:

1. **power.config.jsonのJSON構文を確認**
   - 最も一般的な原因
   - JSON検証ツールでエラーがないか確認
   - 特に`connectionReferences`と`databaseReferences`のネスト構造を確認

2. **connectionReferencesとdatabaseReferencesの両方が存在するか確認**
   ```json
   {
     "connectionReferences": {
       // データソース接続の定義
     },
     "databaseReferences": {
       "default.cds": {
         // Dataverseインスタンスの定義
       }
     }
   }
   ```

3. **dataSourcesInfo.tsが存在するか確認**
   - `.power/schemas/appschemas/dataSourcesInfo.ts`
   - `pac code add-data-source`で自動生成される

4. **生成されたサービスが正しくインポートされているか確認**
   ```typescript
   import { Geek_businessprocessesService } from '@/generated/services/Geek_businessprocessesService';
   ```

5. **ビルドとデプロイを再実行**
   ```bash
   npm run build
   pac code push
   ```

6. **ブラウザキャッシュをクリア**
   - `Ctrl + Shift + R`で強制リロード

### Create操作で"ownerid is required"エラー

Dataverseテーブルで`ownerid`が必須フィールドの場合、型アサーションを使用します：

```typescript
await Geek_businessprocessesService.create({
  geek_processname: name,
  geek_description: description,
  geek_markdowndetails: markdown
} as any);
```

**理由**: 
- `ownerid`と`owneridtype`はDataverseが自動設定する
- 生成された型定義では必須だが、実際には送信不要
- 型アサーション`as any`で型チェックを回避

---

## 開発ワークフロー

### 推奨される開発フロー

1. **データソースの追加**
   ```bash
   pac code add-data-source -a "shared_commondataserviceforapps" -c "<connection-id>" -t "<table-name>" -d "<dataset-name>"
   ```

2. **生成されたファイルの確認**
   - `src/generated/services/<Table>Service.ts`
   - `src/generated/models/<Table>Model.ts`
   - `.power/schemas/appschemas/dataSourcesInfo.ts`
   - `power.config.json`（変更内容を確認）

3. **コンポーネントで生成されたサービスを使用**
   ```typescript
   import { YourTableService } from '@/generated/services/YourTableService';
   
   const data = await YourTableService.getAll();
   ```

4. **ローカルビルドでテスト**
   ```bash
   npm run build
   ```

5. **デプロイ**
   ```bash
   pac code push
   ```

6. **ブラウザで動作確認**
   - デプロイ後のURLを開く
   - `Ctrl + Shift + R`で強制リロード
   - Dataverse操作が正常に動作するか確認

---

## まとめ

Power Apps Code AppsでDataverseを統合する際の最重要ポイント：

✅ **`pac code add-data-source`を使用する**  
✅ **自動生成されたファイルを改変しない**  
✅ **power.config.jsonのJSON構文を検証する**  
✅ **生成されたサービスクラスを使用する**  
✅ **デプロイ後はブラウザキャッシュをクリアする**

これらを守ることで、Dataverse統合時のトラブルを大幅に削減できます。

---

## 参考リンク

- [Power Apps Code Apps Documentation](https://learn.microsoft.com/power-apps/developer/code-apps/)
- [pac code CLI Reference](https://learn.microsoft.com/power-platform/developer/cli/reference/code)
- [Dataverse Web API Reference](https://learn.microsoft.com/power-apps/developer/data-platform/webapi/overview)

---

**最終更新**: 2026年2月5日
