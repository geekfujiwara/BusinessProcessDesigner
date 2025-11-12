import powerAppsLogo from "/power-apps.svg"
import reactLogo from "@/assets/react.svg"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LinkConfirmModal, useLinkModal } from "@/components/link-confirm-modal"
import { ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"

export default function HomePage() {
  const { modalData, openModal, closeModal } = useLinkModal()

  const handleLogoClick = (url: string, title: string, description: string) => {
    openModal(url, title, description)
  }

  return (
    <div className="h-full grid place-items-center py-8">
      <div className="w-full max-w-7xl px-8 text-center flex flex-col items-center space-y-6">

        <div className="flex items-center justify-center space-x-8">
          <button
            onClick={() => handleLogoClick(
              "https://github.com/microsoft/PowerAppsCodeApps",
              "Power Apps Code Apps",
              "Microsoft公式のPower Appsコードアプリ開発ドキュメントとリソース"
            )}
            className="transition-transform hover:scale-105"
          >
            <img
              src={powerAppsLogo}
              className="h-24 w-24"
              alt="Power Apps logo"
            />
          </button>
          
          <button
            onClick={() => handleLogoClick(
              "https://react.dev",
              "React",
              "React公式サイト - モダンなユーザーインターフェースを構築するためのライブラリ"
            )}
            className="transition-transform hover:scale-105"
          >
            <img
              src={reactLogo}
              className="h-24 w-24 motion-safe:animate-[spin_20s_linear_infinite]"
              alt="React logo"
            />
          </button>
          
          <button
            onClick={() => handleLogoClick(
              "https://github.com/geekfujiwara/CodeAppsDevelopmentStandard",
              "Geek開発標準",
              "Power Appsコードアプリ開発のためのコーディング規約とベストプラクティス集"
            )}
            className="transition-transform hover:scale-105"
          >
            <img
              src="/geekfujiwara.svg"
              className="h-24 w-24"
              alt="Geek開発標準"
            />
          </button>
        </div>

        <h1 className="text-5xl leading-tight tracking-tight">Power + Code + Geek開発標準</h1>
        
        <p className="text-lg text-muted-foreground max-w-3xl">
          Power Apps コードアプリ開発用のモダンなスターターテンプレートです。
          Vite、TypeScript、React を使用し、一般的なアプリケーションシナリオ向けに最適化されています。
        </p>

        <Card>
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <p className="text-sm text-muted-foreground">
              このテンプレートは <strong className="text-foreground">Geek Fujiwara</strong> によって作成されました
            </p>
            <Link to="/guide">
              <Button variant="default" className="space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span>開発標準ガイドを見る</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center space-y-2">
          <p className="text-muted-foreground text-sm">
            ロゴをクリックして各技術の詳細を確認してください
          </p>
        </div>

        <LinkConfirmModal
          isOpen={modalData.isOpen}
          onClose={closeModal}
          url={modalData.url}
          title={modalData.title}
          description={modalData.description}
        />
      </div>
    </div>
  )
}
