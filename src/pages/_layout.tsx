import { useState } from "react"
import { Outlet, NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { HamburgerMenu } from "@/components/hamburger-menu"
import { toast } from "sonner"
import { Twitter, Youtube, BookOpen, GraduationCap } from "lucide-react"

type LayoutProps = { showHeader?: boolean }

export default function Layout({ showHeader = true }: LayoutProps) {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-dvh flex flex-col">
      {showHeader && (
        <header className="h-16 border-b flex items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="mx-auto w-full max-w-7xl px-6 flex items-center justify-between">
            {/* 左側: ロゴとナビゲーション */}
            <div className="flex items-center gap-6">
              <HamburgerMenu />

              {/* デスクトップナビゲーション */}
              <nav className="hidden md:flex items-center gap-6">
                <NavLink to="/" end
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-foreground/80 ${
                      isActive ? "text-foreground" : "text-foreground/60"
                    }`
                  }
                >
                  ホーム
                </NavLink>
                <NavLink to="/guide"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-foreground/80 ${
                      isActive ? "text-foreground" : "text-foreground/60"
                    }`
                  }
                >
                  開発標準ガイド
                </NavLink>
              </nav>
            </div>

            {/* 右側: 機能ボタン */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCount((c) => c + 1)}
                className="hidden sm:flex"
              >
                カウント {count}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast.info("Power Apps からこんにちは！")}
              >
                
              </Button>

              <ModeToggle />
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 flex">
        <div className="flex-1 mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>

      <footer className="border-t py-6 bg-background">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Created by <span className="font-semibold text-foreground">Geek Fujiwara</span>
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/geekfujiwara"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@geekfujiwara"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://www.udemy.com/user/gikuhuziwarateng-yuan-hong-dao/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Udemy"
              >
                <GraduationCap className="h-5 w-5" />
              </a>
              <a
                href="https://www.geekfujiwara.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Blog"
              >
                <BookOpen className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
