import { useState } from "react"
import { NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* ハンバーガーメニューボタン */}
      <Button variant="ghost" size="icon" onClick={toggleMenu} className="md:hidden">
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* サイドメニュー */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-950 border-r shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">メニュー</h2>
            <Button variant="ghost" size="icon" onClick={closeMenu}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* ナビゲーションリンク */}
          <nav className="flex-1 p-4 space-y-2">
            <NavLink
              to="/"
              end
              onClick={closeMenu}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
               ホーム
            </NavLink>

            <NavLink
              to="/guide"
              onClick={closeMenu}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
               開発標準ガイド
            </NavLink>

            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-muted-foreground mb-3 px-4">外部リンク</p>

              <a
                href="https://github.com/microsoft/PowerAppsCodeApps"
                target="_blank"
                rel="noreferrer noopener"
                className="block px-4 py-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                 Power Apps Code Apps
              </a>

              <a
                href="https://react.dev"
                target="_blank"
                rel="noreferrer noopener"
                className="block px-4 py-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                 React 公式サイト
              </a>

              <a
                href="https://github.com/geekfujiwara/CodeAppsDevelopmentStandard"
                target="_blank"
                rel="noreferrer noopener"
                className="block px-4 py-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                 Geek開発標準
              </a>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}
