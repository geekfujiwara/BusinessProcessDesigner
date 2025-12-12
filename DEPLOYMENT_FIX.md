# Power Apps デプロイメント問題の修正

## 🔍 問題の原因

Power Apps にデプロイ後、アプリが開けない主な原因:

### 1. **power.config.json ファイルが存在しない** (最重要)
- このファイルがないと、Power Apps はアプリを初期化できません
- `pac code init` コマンドで自動的に作成されるはずです

### 2. PowerProvider の実装が複雑すぎた
- 不要な `initializedCalled` フラグを使用していました
- 最新の公式テンプレートではより単純な実装が推奨されています

## ✅ 修正内容

### 1. PowerProvider の簡素化 (完了)
[src/providers/power-provider.tsx](src/providers/power-provider.tsx) を最新テンプレートに準拠した実装に変更:

```tsx
// 変更前: initializedCalled フラグを使用
let initializedCalled = false;
export function PowerProvider({ children }: PowerProviderProps) {
  useEffect(() => {
    if (initializedCalled) return;
    initializedCalled = true;
    // ...
  }, []);
  return <>{children}</>;
}

// 変更後: シンプルな実装
export function PowerProvider({ children }: PowerProviderProps) {
  useEffect(() => {
    const initApp = async () => {
      try {
        await initialize();
        console.log('Power Platform SDK initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Power Platform SDK:', error);
      }
    };
    initApp();
  }, []);
  return <>{children}</>;
}
```

## 🚀 正しいデプロイ手順

### 前提条件
- Power Platform CLI (pac) がインストール済み
- Power Apps 環境にログイン済み
- Node.js と npm がインストール済み

### ステップ 1: Power Apps 環境の設定

```powershell
# Power Platform にログイン
pac auth create

# 使用する環境を選択
pac env select

# Power Apps Code 初期化 (power.config.json を作成)
pac code init
```

⚠️ **重要**: `pac code init` を実行すると、プロジェクトルートに `power.config.json` ファイルが作成されます。このファイルには以下の情報が含まれます:
```json
{
  "environmentId": "your-environment-id",
  "displayName": "Your App Name"
}
```

### ステップ 2: ビルド

```powershell
npm run build
```

ビルドが正常に完了することを確認してください。エラーがある場合は、デプロイ前に修正してください。

### ステップ 3: デプロイ

```powershell
pac code push
```

成功すると、アプリの URL が表示されます:
```
Successfully pushed app to Power Apps!
Play URL: https://apps.powerapps.com/play/e/{environmentId}/a/{appId}
```

### ステップ 4: アプリを開く

1. 表示された URL をクリック、または [Power Apps Maker Portal](https://make.powerapps.com) にアクセス
2. **重要**: Power Platform 環境にログインしているのと**同じブラウザプロファイル**でアクセスしてください
3. 左側のメニューから「アプリ」を選択
4. デプロイしたアプリを見つけて「再生」をクリック

## ⚠️ トラブルシューティング

### "fetching your app" のローディング画面で止まる場合

公式ドキュメントによる確認項目:

1. **npm run build を実行したか**
   ```powershell
   npm run build
   ```
   
2. **power.config.json が存在するか**
   ```powershell
   # ファイルの存在を確認
   Test-Path .\power.config.json
   # True と表示されるべきです
   ```
   
   存在しない場合:
   ```powershell
   pac code init
   ```

3. **PowerProvider.tsx に問題がないか**
   - コンソールログを確認: `Failed to initialize Power Platform SDK` のようなエラーがないか
   - 本修正で PowerProvider は最新テンプレートに準拠済みです

4. **ブラウザプロファイルが正しいか**
   - Power Platform 環境にログインしているのと**同じブラウザプロファイル**でアプリを開いてください
   - 別のプロファイルや別のブラウザでは動作しません

5. **環境に必要なコネクタが有効か**
   - Power Apps 環境で使用するコネクタ (Office 365、SQL など) が有効になっているか確認

### "App timed out" エラーが表示される場合

同じ確認項目を再度チェックし、特に以下を確認:

1. `npm run build` が正常に完了している
2. `dist` フォルダにビルド成果物が存在する
3. `power.config.json` が正しい環境 ID を含んでいる

### コンソールにエラーが表示される場合

ブラウザの開発者ツール (F12) を開いてコンソールを確認:
```
Power Platform SDK initialized successfully
```
このメッセージが表示されれば、SDK は正常に初期化されています。

エラーが表示される場合:
```
Failed to initialize Power Platform SDK: Error...
```
エラー内容を確認し、必要に応じて環境設定を見直してください。

## 📚 参考リソース

- [Power Apps Code Apps 公式ドキュメント](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/)
- [microsoft/PowerAppsCodeApps GitHub リポジトリ](https://github.com/microsoft/PowerAppsCodeApps)
- [クイックスタート: コードアプリの作成](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-an-app-from-scratch)

## 🔄 再デプロイの手順

コードを変更した後の再デプロイ:

```powershell
# 1. ビルド
npm run build

# 2. デプロイ
pac code push
```

⚠️ **注意**: `pac code init` は最初の一度だけ実行します。再デプロイ時は不要です。

## ✅ 修正完了のチェックリスト

- [x] PowerProvider を最新テンプレートに準拠 (完了)
- [x] npm run build が正常に完了 (確認済み)
- [ ] power.config.json が存在する (**ユーザーが `pac code init` を実行する必要があります**)
- [ ] Power Platform にログイン済み
- [ ] 正しい環境を選択済み
- [ ] 同じブラウザプロファイルでアプリを開く

---

## 次のステップ

1. **`pac code init` を実行** (まだ実行していない場合):
   ```powershell
   pac code init
   ```

2. **ビルドとデプロイ**:
   ```powershell
   npm run build
   pac code push
   ```

3. **ブラウザで確認**:
   - 表示された URL にアクセス
   - または https://make.powerapps.com からアプリを開く
   - **必ず Power Platform にログインしているのと同じブラウザプロファイルを使用してください**

問題が解決しない場合は、ブラウザのコンソール (F12) でエラーメッセージを確認してください。
