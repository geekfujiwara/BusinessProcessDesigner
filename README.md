# 業務プロセスエディタ (Business Process Editor)

**Vite + TypeScript + React + Dataverse** を使用した業務プロセス設計・管理アプリケーション

Power Apps Code Apps として実装された、業務プロセスを視覚的に設計・管理できるWebアプリケーションです。

---

## 主な特徴

- **📊 Swimlaneダイアグラム** - 部門ごとに整理された視覚的なフロー図
- **🎯 ビジュアルエディタ** - ドラッグ&ドロップでプロセスを設計
- **📝 マークダウン対応** - テキストベースでの編集とインポート/エクスポート
- **💾 Dataverse統合** - Power Platformとのシームレスな連携
- **🤖 M365 Copilot対応** - AIによる業務プロセス自動生成
- **🎨 モダンUI** - shadcn/ui、Tailwind CSSを活用した洗練されたデザイン
- **📱 レスポンシブ** - デスクトップ、タブレット、モバイル対応
- **🌙 ダークモード** - 目に優しいダークテーマ対応
- **🔒 エンタープライズ対応** - Dataverseによるセキュアなデータ管理

---

## クイックスタート

### 前提条件

- Node.js (最新LTS版推奨)
- Git
- VS Code (推奨)
- Power Apps CLI
- Power Apps Premium ライセンス (Dataverse利用時)
- M365 Copilot (AI自動生成機能利用時)

### インストール

```powershell
# リポジトリをクローン
git clone https://github.com/geekfujiwara/CodeAppsStarter.git
cd BusinessProcessEditer

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:5173` を開いてアプリの動作を確認してください。

---

## Dataverse設定

### テーブル定義

プロジェクトには以下のDataverseテーブル定義が含まれています:

- **BusinessProcess (geek_businessprocesses)** - 業務プロセスのメインテーブル
  - プロセス名、説明、マークダウン定義、関連ドキュメントURL等
  
詳細なテーブル定義は `dataverse-tables/` フォルダを参照してください。

### 環境構築

```powershell
# Power Apps環境の初期化
pac code init -n "Business Process Editor" -env <your-environment-id>

# Dataverseデータソースの追加
pac code add-data-source -a "dataverse" -t "geek_businessprocesses"
```

---

## 使い方

### 1. 新規プロセス作成

#### 方法A: マークダウンから作成（M365 Copilot利用）

1. ホーム画面で「M365 Copilotでプロセスを作成」カードを選択
2. プロンプトをコピー
3. M365 Copilotに業務マニュアル（Word/PDF等）を添付してプロンプトを送信
4. 生成されたマークダウンをコピー
5. デザイナー画面で「マークダウン読込」からインポート

#### 方法B: 手動で作成

1. デザイナー画面で「新規作成」をクリック
2. サイドパネルでスイムレーン（担当部門）を追加
3. ノード（プロセスステップ）を追加
4. ノード間の接続を設定
5. 関連システムと帳票を追加

### 2. プロセスの編集

- **ビジュアルタブ**: Swimlaneダイアグラムで視覚的に編集
- **マークダウンタブ**: テキストベースで直接編集
- サイドパネルでノード、スイムレーン、システム、帳票を管理

### 3. プロセスの保存

- 「Dataverseに保存」ボタンでPower Platformに保存
- 自動的にバージョン管理され、変更履歴が記録されます

### 4. プロセスの閲覧・管理

- プロセス一覧画面で登録済みプロセスを検索・閲覧
- カードをクリックして編集、削除が可能

---

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- Vite
- React Router
- Zustand (状態管理)
- TanStack Query (データフェッチ)

### UI/UX
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Sonner (トースト通知)

### Power Platform統合
- Power Apps Code CLI
- Dataverse REST API
- Power Apps SDK

---

## プロジェクト構成

```
BusinessProcessEditer/
├── src/
│   ├── components/
│   │   ├── business-process/    # プロセスエディタコンポーネント
│   │   │   ├── swimlane-diagram.tsx
│   │   │   ├── process-editor-panel.tsx
│   │   │   ├── markdown-parser.ts
│   │   │   └── nodes/           # ノード型コンポーネント
│   │   ├── ui/                  # shadcn/uiコンポーネント
│   │   └── copilot-prompt-button.tsx
│   ├── pages/
│   │   ├── home.tsx
│   │   ├── process-list.tsx
│   │   └── process-editor.tsx
│   ├── stores/
│   │   └── flowchart-store.ts   # Zustand状態管理
│   ├── types/
│   │   └── flowchart.ts
│   └── generated/               # Power SDK自動生成コード
├── dataverse-tables/            # Dataverseテーブル定義
└── .power/                      # Power Apps設定
```

---

## 開発ガイド

### ローカル開発

```powershell
npm run dev
```

### ビルド

```powershell
npm run build
```

### Power Appsへのデプロイ

```powershell
npm run build
pac code push
```

---

## マークダウンフォーマット仕様

業務プロセスは以下のマークダウンフォーマットで記述できます:

```markdown
# BusinessProcessName
{プロセス名}

## Description
{プロセスの説明}

## Dept
{部門1}
{部門2}
...

## Process
#P{番号} #L{行番号} {部門} {ステップ名}
Next: P{次のステップ番号}

#P{番号} #L{行番号} {部門} {判断ステップ名}
Yes: P{承認時の次ステップ}
No: P{却下時の次ステップ}

## Reports
{帳票名} #L: {関連行番号}, {関連行番号}, ...

## Systems
{システム名} #L: {関連行番号}, {関連行番号}, ...  
```

詳細は `src/components/business-process/markdown-parser.ts` を参照してください。

---

## コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容について議論してください。

---

## ライセンス

MIT License

---

## 作成者

### Geek Fujiwara

- X: [@geekfujiwara](https://x.com/geekfujiwara)
- YouTube: [Geek Fujiwara チャンネル](https://www.youtube.com/@geekfujiwara)
- Udemy: [コース一覧](https://www.udemy.com/user/gikuhuziwarateng-yuan-hong-dao/)
- ブログ: [geekfujiwara.com](https://www.geekfujiwara.com/)

---

## 謝辞

このアプリケーションは、Microsoft の [Power Apps Code Apps](https://github.com/microsoft/PowerAppsCodeApps) プロジェクトをベースに開発されています。
