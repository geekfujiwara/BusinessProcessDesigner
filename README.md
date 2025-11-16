# Power Apps Code Apps 開発テンプレート

**Vite + TypeScript + React** を使用した Power Apps コードアプリ開発用のモダンなスターターテンプレートです。

<img width="1912" height="924" alt="image" src="https://github.com/user-attachments/assets/3942364a-4ed1-49fd-b72b-b1d0b71934b0" />


Microsoft Learn Catalog API データをサンプルとして活用し、ダッシュボード、フォーム、ギャラリー、フィルター、カード表示などの実装パターンを紹介します。




---

##  主な特徴

- **モダンなツール** - Vite、TypeScript、React を採用
- **すぐに使えるスタイリング** - Tailwind CSS、shadcn/ui コンポーネント、テーマ機能を標準装備
- **サンプル実装** - Learn API データを活用したギャラリー、フォーム、フィルター、カード表示の実装例
- **API 連携パターン** - React Query を使用したデータフェッチとキャッシングの実装例
- **標準パターン** - 業界標準のパターンとベストプラクティス
- **AI エージェントフレンドリー** - コーディングエージェントでの使用に最適化
- **日本語UI** - 日本語でのユーザーインターフェース
- **レスポンシブデザイン** - モバイル対応のサイドバーナビゲーション
- **使い方ガイド** - GitHub Copilot との連携方法を含む詳細なガイド




https://github.com/user-attachments/assets/d9cef0e8-91ca-41ea-b40f-5f342dd98a13



---

## サンプル実装

このテンプレートには、Microsoft Learn Catalog API を活用した以下のサンプル実装が含まれています:

### 🎨 ギャラリー&フィルター実装

- 検索機能付きアイテムギャラリー
- 複数条件フィルタリング (ロール、プロダクト、レベル)
- ページネーション
- レスポンシブグリッドレイアウト

<img width="1974" height="1035" alt="image" src="https://github.com/user-attachments/assets/66c8ef26-fa6d-451c-a0c8-333a5f390384" />

<img width="1953" height="686" alt="image" src="https://github.com/user-attachments/assets/39dc9a75-f0d7-4944-91fb-a26092646ff0" />


### 📝 フォーム実装

- モーダルベースのフォーム
- API データを活用した動的フォームフィールド
- バリデーションとエラーハンドリング

<img width="913" height="844" alt="image" src="https://github.com/user-attachments/assets/ff0d712b-74e9-4757-a632-9bc820be3e0a" />


### 📊 ダッシュボード実装

- 統計カード表示
- データの集計と可視化
- カードベースのレイアウト

<img width="1890" height="1068" alt="image" src="https://github.com/user-attachments/assets/5a99c6b2-6814-4568-8ae0-c64644d6b79e" />

### 🎴 カード表示実装


- Learn データを活用したカードコンポーネント
- バッジとメタデータ表示
- 外部リンク確認モーダル

<img width="1561" height="357" alt="image" src="https://github.com/user-attachments/assets/501d9e8e-48d1-43e6-b362-cbaae9c3d1e6" />

### 🎯 タスク優先順位管理
ドラッグ&ドロップでタスクの並び順を変更できるインタラクティブなリスト

<img width="1947" height="1282" alt="image" src="https://github.com/user-attachments/assets/c7737f0c-4388-426c-94af-ee57391e9116" />

### 📋 カンバンボード
タスクをドラッグ&ドロップでステータス間を移動できるカンバンビュー

<img width="1949" height="1142" alt="image" src="https://github.com/user-attachments/assets/108dc6cf-cd0d-4fa4-b9f4-18f563501c26" />


### 📅 ガントチャート
タスクをドラッグで移動、ハンドルで期間変更できるインタラクティブなガントチャート

<img width="2037" height="1317" alt="image" src="https://github.com/user-attachments/assets/5854895c-1ec6-43f9-b274-7e75982f0f18" />

---

## クイックスタート

### 前提条件

- Node.js (最新LTS版推奨)
- Git
- VS Code (推奨)
- GitHub Copilot 拡張機能 (推奨)
- GitHub Pro / Enterprise ライセンス
- Power Apps Premium ライセンス

### インストール

```PowerShell
# リポジトリをクローン
git clone https://github.com/geekfujiwara/CodeAppsStarter.git
cd CodeAppsStarter
```

```PowerShell
# 依存関係をインストール
npm install
```

```PowerShell
# 開発サーバーを起動
npm run dev
```

ブラウザで自動的に開かれるアプリの動作を確認してください。

ここまでできましたら起動された Code Apps Starter アプリ内のガイドのとおりに実行してください。

---

## テンプレートの使い方

このテンプレートには、GitHub Copilot を活用した効率的な開発方法を説明する詳細なガイドページが含まれています。

アプリを起動後、「このテンプレートの使い方」ページにアクセスして、以下の情報を確認できます:

1. **開発環境のセットアップ** - 必要なツールとセットアップコマンド
2. **Power Apps へのデプロイ準備** - `pac code init` コマンドの使い方
3. **開発標準の活用方法** - GitHub Copilot との連携方法

詳細な開発標準については、[CodeAppsDevelopmentStandard](https://github.com/geekfujiwara/CodeAppsDevelopmentStandard) リポジトリを参照してください。

---

## 機能

### 実装済みの機能

- **サンプル実装** - Learn API を活用したギャラリー、フォーム、フィルター、カード表示の実装例
- **API 連携** - React Query を使用したデータフェッチとキャッシング
- **ダークモード対応** - システム設定に合わせた自動切り替え
- **レスポンシブデザイン** - モバイル、タブレット、デスクトップに対応
- **サイドバーナビゲーション** - コラップス可能なナビゲーション
- **リンク確認モーダル** - 外部リンクを開く前の確認ダイアログ
- **使い方ガイド** - GitHub Copilot 連携ガイドとURL コピー機能
- **日本語ローカライゼーション** - 完全な日本語UI

### ダッシュボード

- 統計カードによるデータ可視化
- 人気モジュールのハイライト表示
- フォーム実装サンプル
- カード表示サンプル

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

このテンプレートは、Microsoft の [Power Apps Code Apps](https://github.com/microsoft/PowerAppsCodeApps) プロジェクトをベースに、日本語環境と開発標準を統合したものです。
