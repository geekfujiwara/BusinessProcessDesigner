import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CopilotPromptButton } from "@/components/copilot-prompt-button"
import { Link } from "react-router-dom"
import { 
  FileText, 
  Sparkles, 
  Edit3, 
  Download, 
  Layers,
  Database,
  FolderOpen,
  ArrowRight,
  RefreshCw
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto py-8 px-6 space-y-8">
        {/* ヒーローセクション */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl font-bold">業務プロセスデザイナー</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            M365 Copilotと連携して業務プロセスを簡単に作成・可視化。<br />
            スイムレーン付きフローチャートで業務フローを整理・管理できます。
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Link to="/process-list">
              <Button size="lg" variant="outline" className="gap-2">
                <FolderOpen className="h-5 w-5" />
                業務プロセス一覧
              </Button>
            </Link>
            <Link to="/process-editor">
              <Button size="lg" className="gap-2">
                <Edit3 className="h-5 w-5" />
                デザイナーを開く
              </Button>
            </Link>
          </div>
        </div>

        {/* 主な機能 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">主な機能</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  M365 Copilot連携
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  業務マニュアルを添付するだけで、Copilotが業務プロセスのマークダウンを自動生成。手軽に業務フローを作成できます。
                </CardDescription>
              </CardContent>
            </Card>



            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  スイムレーン表示
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  担当部門ごとにスイムレーンで区切られたフローチャート。部門間の連携や責任範囲が一目でわかります。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Dataverse連携
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  作成した業務プロセスをDataverseに保存。一覧表示や編集、更新が可能で、組織全体で業務フローを管理できます。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  複数形式対応
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  マークダウン形式でのエクスポートに対応。業務マニュアルとしてドキュメント化や共有が簡単です。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  一覧管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  登録済みの業務プロセスを一覧表示。検索機能で目的のプロセスをすぐに見つけて編集できます。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  既存プロセス編集
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  保存済みの業務プロセスを再度開いて編集。フローチャートやマークダウンを直接修正して更新できます。
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 使い方ガイド */}
        <div className="space-y-4" id="copilot-guide">
          <h2 className="text-2xl font-bold text-center">使い方</h2>
          <div className="space-y-6">
            {/* M365 Copilot連携カード */}
            <CopilotPromptButton variant="card" />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</span>
                  Copilotでマークダウンを作成
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  上のカードから「プロンプトをコピー」ボタンをクリックし、M365 Copilotに業務マニュアルを添付してプロンプトを貼り付けます。Copilotが業務プロセスのマークダウンを自動生成します。デザイナー画面で「マークダウン読込」ボタンを使って読み込んでください。
                </p>
              </CardContent>
            </Card>



            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</span>
                  フローを確認・編集
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  スイムレーン図で業務フローを視覚的に確認。必要に応じて右側のパネルから編集モードにして、ノードの追加や順序変更ができます。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</span>
                  Dataverseに保存
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  「Dataverseに保存」ボタンで業務プロセスを保存。業務プロセス一覧から後で編集や更新ができます。マークダウン出力も可能です。
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <FolderOpen className="h-5 w-5" />
                  既存プロセスの編集
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  「業務プロセス」メニューから登録済みプロセスの一覧を表示。各プロセスの「編集」ボタンでデザイナーが開き、Dataverseに保存すると更新されます。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8">
          <div className="flex gap-3 justify-center">
            <Link to="/process-list">
              <Button size="lg" variant="outline" className="gap-2">
                <FolderOpen className="h-5 w-5" />
                業務プロセス一覧を見る
              </Button>
            </Link>
            <Link to="/process-editor">
              <Button size="lg" className="gap-2">
                <FileText className="h-5 w-5" />
                今すぐ始める
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
