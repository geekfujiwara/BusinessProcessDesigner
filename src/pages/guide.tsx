import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, CheckCircle, Github, ExternalLink, Lightbulb } from "lucide-react"
import { toast } from "sonner"

export default function GuidePage() {
  const [copied, setCopied] = useState(false)
  const developmentStandardUrl = "https://github.com/geekfujiwara/CodeAppsDevelopmentStandard"

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(developmentStandardUrl)
      setCopied(true)
      toast.success("URLをクリップボードにコピーしました！")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("クリップボードへのコピーに失敗しました")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ヘッダーセクション */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <img src="/geekkumanomi.svg" className="h-8 w-8" alt="Geek" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">開発標準ガイド</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          GitHub Copilot を使用して効率的な Power Apps コードアプリ開発を始めよう
        </p>
      </div>

      {/* 開始手順 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
            開発環境のセットアップ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">必要なツール</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• VS Code</li>
                <li>• GitHub Copilot 拡張機能</li>
                <li>• Node.js (最新LTS版)</li>
                <li>• Git</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">セットアップコマンド</h4>
              <div className="bg-muted p-3 rounded-md font-mono text-sm">
                <div>git clone [このリポジトリURL]</div>
                <div>cd CodeAppsStarter</div>
                <div>npm install</div>
                <div>npm run dev</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Power Apps へのデプロイ準備 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
            Power Apps へのデプロイ準備
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Power Apps コードアプリとして展開する準備を行います。
            </p>
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-semibold mb-2 text-sm">コマンド</h4>
              <div className="font-mono text-sm bg-background p-3 rounded border">
                pac code init --environment &lt;環境ID&gt; --displayname &lt;アプリ名&gt;
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">パラメータ説明</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• <strong>環境ID</strong>: デプロイ先のPower Apps環境の識別子</li>
                <li>• <strong>アプリ名</strong>: Power Appsに表示されるアプリケーション名</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 開発標準の活用 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
            開発標準の活用方法
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* GitHub Copilot への指示カード */}
          <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">GitHub Copilot への指示</CardTitle>
              </div>
              <CardDescription className="text-base">
                以下のメッセージをGitHub Copilotに伝えて、開発標準に基づいた効率的な開発を始めましょう!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-background/50 p-6 rounded-lg border border-dashed border-primary/30">
                <p className="text-lg leading-relaxed mb-4">
                  <strong>🚀 GitHub Copilot さん、こんにちは!</strong>
                </p>
                <p className="mb-4">
                  このリポジトリをクローンして、Power Apps コードアプリの開発を始めたいと思います。
                  開発標準に従って効率的にアプリを作りたいので、以下の開発標準URLを参考にして、
                  私のアイディアを実現するお手伝いをしてください!
                </p>
                
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md font-mono text-sm">
                  <span className="flex-1">{developmentStandardUrl}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="shrink-0"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <p className="mt-4 text-muted-foreground">
                  💡 <strong>アイディアを伝える準備ができたら</strong>、具体的な機能や画面について教えてください!
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-1">STEP 1</Badge>
              <div>
                <h4 className="font-semibold mb-1">開発標準URLを共有</h4>
                <p className="text-sm text-muted-foreground">
                  上記のURLをGitHub Copilotに提供して、コーディング規約と設計パターンを理解してもらいます。
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-1">STEP 2</Badge>
              <div>
                <h4 className="font-semibold mb-1">具体的なアイディアを伝達</h4>
                <p className="text-sm text-muted-foreground">
                  作りたい機能、画面設計、データ構造などを詳しく説明します。
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-1">STEP 3</Badge>
              <div>
                <h4 className="font-semibold mb-1">協力して実装</h4>
                <p className="text-sm text-muted-foreground">
                  GitHub Copilotと一緒に、標準に準拠したクリーンなコードを作成していきます。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 参考リンク */}
      <Card>
        <CardHeader>
          <CardTitle>参考リンク</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <a 
            href={developmentStandardUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
          >
            <Github className="h-5 w-5" />
            <div className="flex-1">
              <div className="font-medium">Geek開発標準</div>
              <div className="text-sm text-muted-foreground">コーディング規約とベストプラクティス</div>
            </div>
            <ExternalLink className="h-4 w-4" />
          </a>
          
          <a 
            href="https://github.com/microsoft/PowerAppsCodeApps"
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
            <div className="flex-1">
              <div className="font-medium">Power Apps Code Apps</div>
              <div className="text-sm text-muted-foreground">Microsoft公式ドキュメント</div>
            </div>
            <ExternalLink className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>
    </div>
  )
}