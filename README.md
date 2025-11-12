# Power Apps Code Apps スターターテンプレート

**Vite + TypeScript + React** を使用した Power Apps コードアプリ開発用のモダンなスターターテンプレートです。

一般的なアプリケーションシナリオ向けに最適化され、簡単に拡張でき、最小限のセットアップで開始できます。

---

##  主な特徴

- ** モダンなツール** - Vite、TypeScript、React を採用
- ** すぐに使えるスタイリング** - Tailwind CSS、shadcn/ui コンポーネント、テーマ機能を標準装備
- ** 必要なものがすべて揃っている** - 一般的なシナリオ向けに厳選されたライブラリを事前統合
- ** 標準パターン** - 業界標準のパターンとベストプラクティス
- ** AI エージェントフレンドリー** - コーディングエージェントでの使用に最適化
- ** 日本語UI** - 日本語でのユーザーインターフェース
- ** レスポンシブデザイン** - モバイル対応のハンバーガーメニュー
- ** 開発標準ガイド** - GitHub Copilot との連携方法を含む詳細なガイド

---

##  プリインストールライブラリ

- [Tailwind CSS](https://tailwindcss.com/) - ユーティリティファーストCSS フレームワーク
- [shadcn/ui](https://ui.shadcn.com/) - プリインストールされたUIコンポーネント
- [Lucide](https://lucide.dev/) - 美しく一貫性のあるアイコン
- [React Router](https://reactrouter.com/) - ページ、ルーティング
- [Tanstack Query](https://tanstack.com/query/docs) - データフェッチ、状態管理
- [Tanstack Table](https://tanstack.com/table/docs) - インタラクティブなテーブル、データグリッド
- [sonner](https://sonner.emilkowal.ski/) - トースト通知

---

##  クイックスタート

### 前提条件
- Node.js (最新LTS版推奨)
- Git
- VS Code (推奨)
- GitHub Copilot 拡張機能 (推奨)

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/geekfujiwara/CodeAppsStarter.git
cd CodeAppsStarter

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:5173` を開いて確認してください。

---

##  開発標準ガイド

このテンプレートには、GitHub Copilot を活用した効率的な開発方法を説明する詳細なガイドページが含まれています。

アプリを起動後、「開発標準ガイド」ページにアクセスして、以下の情報を確認できます:

1. **開発環境のセットアップ** - 必要なツールとセットアップコマンド
2. **Power Apps へのデプロイ準備** - `pac code init` コマンドの使い方
3. **開発標準の活用方法** - GitHub Copilot との連携方法

詳細な開発標準については、[CodeAppsDevelopmentStandard](https://github.com/geekfujiwara/CodeAppsDevelopmentStandard) リポジトリを参照してください。

---

##  機能

###  実装済みの機能

- **ダークモード対応** - システム設定に合わせた自動切り替え
- **レスポンシブデザイン** - モバイル、タブレット、デスクトップに対応
- **ハンバーガーメニュー** - モバイル向けのスライドアウトメニュー
- **リンク確認モーダル** - 外部リンクを開く前の確認ダイアログ
- **開発標準ガイド** - GitHub Copilot 連携ガイドとURL コピー機能
- **日本語ローカライゼーション** - 完全な日本語UI

###  ホームページ

- Power Apps、React、Geek開発標準の3つのロゴ表示
- 各ロゴクリックで詳細情報を表示するモーダル
- Geek Fujiwara 作成者クレジット表示

###  フッター

以下のソーシャルリンクを含むフッター:
- X (Twitter): [@geekfujiwara](https://x.com/geekfujiwara)
- YouTube: [Geek Fujiwara チャンネル](https://www.youtube.com/@geekfujiwara)
- Udemy: [コース一覧](https://www.udemy.com/user/gikuhuziwarateng-yuan-hong-dao/)
- ブログ: [geekfujiwara.com](https://www.geekfujiwara.com/)

---

##  Power Apps へのデプロイ

```bash
# Power Apps 環境にアプリを初期化
pac code init --environment <環境ID> --displayname <アプリ名>

# ビルド
npm run build

# Power Apps にデプロイ
pac code push
```

---

##  プロジェクト構造

```
CodeAppsStarter/
 public/              # 静的アセット
    geekkumanomi.svg # Geek アイコン
    power-apps.svg   # Power Apps ロゴ
 src/
    components/      # 再利用可能なコンポーネント
       ui/         # shadcn/ui コンポーネント
       hamburger-menu.tsx
       link-confirm-modal.tsx
       mode-toggle.tsx
    pages/          # ページコンポーネント
       _layout.tsx # レイアウトとヘッダー/フッター
       home.tsx    # ホームページ
       guide.tsx   # 開発標準ガイド
       not-found.tsx
    providers/      # コンテキストプロバイダー
    lib/           # ユーティリティ関数
    router.tsx     # ルーティング設定
 package.json
 vite.config.ts
```

---

##  コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容について議論してください。

---

##  ライセンス

MIT License

---

##  作成者

**Geek Fujiwara**

- X: [@geekfujiwara](https://x.com/geekfujiwara)
- YouTube: [Geek Fujiwara チャンネル](https://www.youtube.com/@geekfujiwara)
- Udemy: [コース一覧](https://www.udemy.com/user/gikuhuziwarateng-yuan-hong-dao/)
- ブログ: [geekfujiwara.com](https://www.geekfujiwara.com/)

---

##  謝辞

このテンプレートは、Microsoft の [Power Apps Code Apps](https://github.com/microsoft/PowerAppsCodeApps) プロジェクトをベースに、日本語環境と開発標準を統合したものです。
