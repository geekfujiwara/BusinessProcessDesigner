import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CodeBlock } from "@/components/code-block"
import { useLearnCatalog } from "@/hooks/use-learn-catalog"
import { LinkConfirmModal, useLinkModal } from "@/components/link-confirm-modal"
import { LoadingSkeletonGrid } from "@/components/loading-skeleton"
import { TaskPriorityList } from "@/components/task-priority-list"
import { GanttChart } from "@/components/gantt-chart"
import { KanbanBoard } from "@/components/kanban-board"
import { ChartDashboard } from "@/components/chart-dashboard"
import { StatsCards, SearchFilterGallery } from "@/components/gallery-components"
import type { GalleryItem, FilterConfig } from "@/components/search-filter-gallery"
import { getBadgeColorClass, flattenItems } from "@/lib/gallery-utils"
import { AlertCircle, BookOpen, Clock, Layers, RefreshCw, Target, List, X } from "lucide-react"

const ITEMS_PER_PAGE = 9

export default function DesignShowcasePage() {
  const queryOptions = useMemo(() => ({ top: 300 }), [])
  const { data, isLoading, isError, error, refetch, summary } = useLearnCatalog(queryOptions)
  const { modalData, openModal, closeModal } = useLinkModal()

  const [isTocOpen, setIsTocOpen] = useState(true)

  const modules = useMemo(() => data?.modules ?? [], [data?.modules])
  const certifications = useMemo(() => data?.certifications ?? [], [data?.certifications])

  const flattenedProducts = useMemo(() => flattenItems(data?.products ?? []), [data?.products])
  const flattenedRoles = useMemo(() => flattenItems(data?.roles ?? []), [data?.roles])

  const productNameMap = useMemo(() => {
    return new Map(flattenedProducts.map((item) => [item.id, item.name]))
  }, [flattenedProducts])

  const roleNameMap = useMemo(() => {
    return new Map(flattenedRoles.map((item) => [item.id, item.name]))
  }, [flattenedRoles])

  const levelOptions = useMemo(() => {
    if (!data?.levels) return []
    const levels = data.levels.map((level) =>
      typeof level === "string" ? level : (level as { id?: string; name?: string }).id ?? (level as { id?: string; name?: string }).name ?? String(level)
    )
    return Array.from(new Set(levels))
  }, [data?.levels])

  const roleOptions = useMemo(() => {
    const fromModules = modules.flatMap((module) => module.roles)
    const ids = fromModules.map((r) =>
      typeof r === "string" ? r : (r as { id?: string }).id ?? String(r)
    )
    return Array.from(new Set(ids))
  }, [modules])

  const productOptions = useMemo(() => {
    const fromModules = modules.flatMap((module) => module.products)
    const ids = fromModules.map((p) =>
      typeof p === "string" ? p : (p as { id?: string }).id ?? String(p)
    )
    return Array.from(new Set(ids))
  }, [modules])

  // Convert modules to GalleryItem format
  const galleryItems = useMemo<GalleryItem[]>(() => {
    return modules.map((module) => ({
      id: module.uid,
      title: module.title,
      description: module.summary,
      badges: [
        ...module.levels.map((level) => ({
          label: level,
          className: getBadgeColorClass(level),
        })),
        ...module.roles.slice(0, 3).map((role) => ({
          label: roleNameMap.get(role) ?? role,
          className: getBadgeColorClass(roleNameMap.get(role) ?? role),
        })),
      ],
      metadata: [
        { label: "製品", value: module.products.map((p) => productNameMap.get(p) ?? p).join(", ") },
        { label: "学習時間", value: `約 ${module.durationInMinutes} 分` },
        ...(module.lastModified ? [{ label: "更新日", value: module.lastModified.substring(0, 10) }] : []),
      ],
      actionLabel: "Learn で開く",
      onAction: () => openModal(module.url, module.title, module.summary),
      // Store raw data for filtering
      _raw: {
        roles: module.roles,
        products: module.products,
        levels: module.levels,
      },
    }))
  }, [modules, productNameMap, roleNameMap, openModal])

  // Filter configuration for FilterableGallery
  const filterConfig = useMemo<FilterConfig[]>(() => [
    {
      key: "role",
      label: "ロール",
      placeholder: "ロールを選択",
      options: [
        { value: "all", label: "すべてのロール" },
        ...roleOptions.map((role) => ({
          value: role,
          label: roleNameMap.get(role) ?? role,
        })),
      ],
    },
    {
      key: "level",
      label: "レベル",
      placeholder: "レベルを選択",
      options: [
        { value: "all", label: "すべてのレベル" },
        ...levelOptions.map((level) => ({
          value: level,
          label: level,
        })),
      ],
    },
    {
      key: "product",
      label: "製品",
      placeholder: "製品を選択",
      options: [
        { value: "all", label: "すべての製品" },
        ...productOptions.map((product) => ({
          value: product,
          label: productNameMap.get(product) ?? product,
        })),
      ],
    },
  ], [roleOptions, roleNameMap, levelOptions, productOptions, productNameMap])

  // Custom filter function for module-specific filtering
  const handleFilterItem = (item: GalleryItem, searchQuery: string, filters: Record<string, string>) => {
    const raw = item._raw as { roles: string[]; products: string[]; levels: string[] }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesTitle = item.title.toLowerCase().includes(query)
      const matchesDescription = item.description?.toLowerCase().includes(query)
      if (!matchesTitle && !matchesDescription) return false
    }

    // Role filter
    if (filters.role && filters.role !== "all") {
      if (!raw.roles.includes(filters.role)) return false
    }

    // Level filter
    if (filters.level && filters.level !== "all") {
      if (!raw.levels.includes(filters.level)) return false
    }

    // Product filter
    if (filters.product && filters.product !== "all") {
      if (!raw.products.includes(filters.product)) return false
    }

    return true
  }

  const featuredCertifications = useMemo(() => certifications.slice(0, 6), [certifications])

  const handleOpenCertification = (url: string, title: string, summary: string) => {
    openModal(url, title, summary)
  }

  return (
    <div className="w-full max-w-full px-4 pb-8 pt-6">
      {/* ヘッダーセクション - グリッドレイアウト */}
      <div className={`grid grid-cols-1 gap-8 mb-8 w-full max-w-full ${isTocOpen ? 'lg:grid-cols-[280px_1fr]' : 'lg:grid-cols-[32px_1fr]'}`}>
        {/* 左側空白（目次用スペース確保） */}
        <div className="hidden lg:block"></div>
        
        {/* ヘッダーコンテンツ */}
        <header className="min-w-0 w-full">
          <div className="space-y-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">実装サンプル</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              デザインテンプレート集です。ギャラリー表示、検索、フィルタリング、ページネーションやカンバンビュー、ガントチャート、フォームの実装例です。開発のテンプレートとしてご利用いただけます。
            </p>
          </div>
        </header>
      </div>

      {/* メインコンテンツ - グリッドレイアウト */}
      <div className={`grid grid-cols-1 gap-8 w-full max-w-full ${isTocOpen ? 'lg:grid-cols-[280px_1fr]' : 'lg:grid-cols-[32px_1fr]'}`}>
        {/* 目次サイドバー */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <button
              onClick={() => setIsTocOpen(!isTocOpen)}
              className={`flex items-center gap-2 font-semibold hover:text-primary transition-colors ${isTocOpen ? 'text-lg mb-4' : 'p-1 mb-2'}`}
              title={isTocOpen ? '目次を閉じる' : '目次を開く'}
            >
              {isTocOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
              {isTocOpen && '目次'}
            </button>
            {isTocOpen && (
              <nav className="space-y-2">
                <a href="#dashboard" className="block text-sm text-muted-foreground hover:text-white hover:bg-accent rounded-md px-3 py-2 transition-colors">
                  データ可視化ダッシュボード
                </a>
                <a href="#stats" className="block text-sm text-muted-foreground hover:text-white hover:bg-accent rounded-md px-3 py-2 transition-colors">
                  統計カード
                </a>
                <a href="#gallery" className="block text-sm text-muted-foreground hover:text-white hover:bg-accent rounded-md px-3 py-2 transition-colors">
                  検索・フィルター & ギャラリー
                </a>
                <a href="#priority" className="block text-sm text-muted-foreground hover:text-white hover:bg-accent rounded-md px-3 py-2 transition-colors">
                  優先順位管理
                </a>
                <a href="#kanban" className="block text-sm text-muted-foreground hover:text-white hover:bg-accent rounded-md px-3 py-2 transition-colors">
                  カンバンボード
                </a>
                <a href="#gantt" className="block text-sm text-muted-foreground hover:text-white hover:bg-accent rounded-md px-3 py-2 transition-colors">
                  ガントチャート
                </a>
              </nav>
            )}
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="space-y-8 min-w-0">
      {/* デザインテンプレート: グラフダッシュボード */}
      <div className="space-y-3" id="dashboard">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">📈 データ可視化ダッシュボード</h2>
          <p className="text-sm text-muted-foreground">
            複数のグラフを組み合わせたデータ分析ダッシュボード
          </p>
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-primary hover:underline">
              GitHub Copilot への指示例
            </summary>
            <div className="mt-2 space-y-2">
              <CodeBlock
                code="recharts と shadcn/ui の ChartContainer を使って、[あなたのデータ]を BarChart、PieChart、LineChart で可視化するダッシュボードを作成して。ChartTooltip でデータ詳細を表示"
                language="text"
                description="複数のグラフでデータを多角的に分析したい場合に使用します"
              />
              <CodeBlock
                code="Card コンポーネント内に recharts のグラフを配置し、2列グリッドレイアウトで表示。各グラフに ChartTooltipContent を追加してカスタムツールチップを実装"
                language="text"
                description="データ分析ダッシュボードを構築する際に活用できます"
              />
            </div>
          </details>
        </div>
      </div>

      <ChartDashboard />

      {/* デザインテンプレート: 統計カード */}
      <div className="space-y-3" id="stats">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">📊 統計カード</h2>
          <p className="text-sm text-muted-foreground">
            アイコン付きのサマリーカードで重要な指標を表示
          </p>
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-primary hover:underline">
              GitHub Copilot への指示例
            </summary>
            <div className="mt-2 space-y-2">
              <CodeBlock
                code="shadcn/ui の Card コンポーネントを使って、[あなたのデータ項目]のアイコン、タイトル、大きな数値、説明文を含む統計カードを4列のグリッドで作成して"
                language="text"
                description="重要な指標を視覚的に表示したい場合に使用します"
              />
              <CodeBlock
                code="CardHeader と CardContent コンポーネントを使って、[あなたのAPI]から取得した[データ種別]の統計情報を表示するサマリーカードを作成"
                language="text"
                description="ダッシュボードのサマリーセクションを構築する際に活用できます"
              />
            </div>
          </details>
        </div>
      </div>

      {/* Summary cards with new component */}
      <StatsCards
        stats={[
          {
            title: "モジュール",
            value: summary?.moduleCount ?? "--",
            description: "サンプルとして取得したモジュール数",
            icon: BookOpen,
          },
          {
            title: "ラーニング パス",
            value: summary?.learningPathCount ?? "--",
            description: "分析対象のラーニング パス数",
            icon: Layers,
          },
          {
            title: "認定資格",
            value: summary?.certificationCount ?? "--",
            description: "取得対象の認定資格数",
            icon: Target,
          },
          {
            title: "平均学習時間",
            value: `${summary?.averageDuration ?? "--"}分`,
            description: "モジュール単位の平均所要時間",
            icon: Clock,
          },
        ]}
        columns={4}
      />

      {/* デザインテンプレート: カード */}
      {!isLoading && featuredCertifications.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">🎓 カード</h2>
            <p className="text-sm text-muted-foreground">
              情報をカード形式で表示し、詳細ページへのリンクを提供
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-primary hover:underline">
                GitHub Copilot への指示例
              </summary>
              <div className="mt-2 space-y-2">
                <CodeBlock
                  code="Card、CardHeader、CardContent、Badge、Button コンポーネントを使って、[あなたのデータ項目]のタイトル、説明、[カテゴリ]バッジ、アクションボタンを含むカードを3列グリッドで作成して"
                  language="text"
                  description="製品や認定資格などの一覧表示に適しています"
                />
                <CodeBlock
                  code="Badge コンポーネントで[属性]タグを表示し、Button コンポーネントで詳細ページへのリンクを持つ[あなたのデータ名]カードギャラリーを作成"
                  language="text"
                  description="詳細情報へのリンク付きカードギャラリーを実装する際に使用します"
                />
              </div>
            </details>
          </div>
        </div>
      )}

      {!isLoading && featuredCertifications.length > 0 && (
        <section id="certifications" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCertifications.map((certification) => (
            <Card key={certification.uid} className="border-secondary/30">
              <CardHeader className="space-y-2">
                <CardTitle className="text-base font-semibold text-foreground">
                  {certification.title}
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground line-clamp-3">
                  {certification.summary}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {certification.products.slice(0, 3).map((product) => (
                    <Badge key={`${certification.uid}-product-${product}`} className={getBadgeColorClass(productNameMap.get(product) ?? product)}>
                      {productNameMap.get(product) ?? product}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => handleOpenCertification(certification.url, certification.title, certification.summary)}
                >
                  <Target className="h-4 w-4" />
                  Learn 認定資格を見る
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* デザインテンプレート: 検索・フィルター & ギャラリー */}
      <div className="space-y-3" id="gallery">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">🔍 検索・フィルター & ギャラリー</h2>
          <p className="text-sm text-muted-foreground">
            検索バー、複数のドロップダウンフィルター、カード形式のギャラリー表示、ページネーション機能を統合
          </p>
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-primary hover:underline">
              GitHub Copilot への指示例
            </summary>
            <div className="mt-2 space-y-2">
              <CodeBlock
                code="Input コンポーネントで検索フィールドを作成し、Combobox コンポーネントで[フィルター項目数]つのドロップダウンフィルターを含むフィルターセクションを作成。各 Combobox は検索可能に"
                language="text"
                description="大量のデータから条件に合う項目を絞り込む機能が必要な場合に使用します"
              />
              <CodeBlock
                code="Card コンポーネントを使って[あなたのデータ]のタイトル、概要、Badge コンポーネントで属性を表示し、Button コンポーネントでアクションを含むカードを3列グリッドで表示。ページネーション付き"
                language="text"
                description="検索・フィルター機能と連携したカードギャラリーを実装する際に活用できます"
              />
            </div>
          </details>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && <LoadingSkeletonGrid columns={3} count={ITEMS_PER_PAGE} variant="detailed" />}

      {/* Error state */}
      {isError && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader className="flex flex-row items-start gap-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <div className="space-y-1">
              <CardTitle className="text-lg">データの読み込みに失敗しました</CardTitle>
              <CardDescription>{error?.message}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              リトライ
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search Filter Gallery Component */}
      {!isLoading && !isError && (
        <SearchFilterGallery
          items={galleryItems}
          filters={filterConfig}
          searchPlaceholder="モジュール名・概要を検索"
          onFilterItem={handleFilterItem}
          itemsPerPage={ITEMS_PER_PAGE}
          columns={3}
          filterCardTitle="検索とフィルター"
          filterCardDescription="要件に合わせてモジュールを絞り込みます"
        />
      )}

      {/* デザインテンプレート: ドラッグ&ドロップ タスク管理 */}
      <div className="space-y-3" id="priority">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">🎯 優先順位管理</h2>
          <p className="text-sm text-muted-foreground">
            ドラッグ&ドロップでタスクの並び順を変更できるインタラクティブなリスト
          </p>
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-primary hover:underline">
              GitHub Copilot への指示例
            </summary>
            <div className="mt-2 space-y-2">
              <CodeBlock
                code="@dnd-kit/core と useSortable フックを使って、Badge コンポーネントで[属性]を表示する[あなたのアイテム]をドラッグ&ドロップで並び替えられるリストを作成して"
                language="text"
                description="タスクやアイテムの優先順位を直感的に変更できる機能が必要な場合に使用します"
              />
              <CodeBlock
                code="SortableContext と verticalListSortingStrategy を使って優先度付き[アイテム名]リスト。各[アイテム]に GripVertical アイコンと Badge コンポーネントで[属性]バッジを表示。ドラッグで順序変更可能に"
                language="text"
                description="インタラクティブな並び替え機能を持つリストコンポーネントを実装する際に活用できます"
              />
            </div>
          </details>
        </div>
      </div>

      <TaskPriorityList />

      {/* デザインテンプレート: カンバンボード */}
      <div className="space-y-3" id="kanban">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">📋 カンバンボード</h2>
          <p className="text-sm text-muted-foreground">
            タスクをドラッグ&ドロップでステータス間を移動できるカンバンビュー
          </p>
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-primary hover:underline">
              GitHub Copilot への指示例
            </summary>
            <div className="mt-2 space-y-2">
              <CodeBlock
                code="@dnd-kit/core の DndContext と SortableContext を使って、Card と Badge コンポーネントで表示する[あなたのタスク]を[ステータス1]、[ステータス2]、[ステータス3]の3列に分けたカンバンボードを作成して"
                language="text"
                description="タスクの進捗状況を視覚的に管理したい場合に使用します"
              />
              <CodeBlock
                code="useSortable フックと DragOverlay を使ってドラッグ&ドロップ対応のカンバンビュー。各カラムに Card コンポーネントでタスクカードを表示し、GripVertical アイコンでドラッグ可能に。カラム間でタスクを移動できるように"
                language="text"
                description="アジャイル開発やタスク管理ツールを実装する際に活用できます"
              />
            </div>
          </details>
        </div>
      </div>

      <KanbanBoard />

      {/* デザインテンプレート: ガントチャート */}
      <div className="space-y-3" id="gantt">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">📅 ガントチャート</h2>
          <p className="text-sm text-muted-foreground">
            タスクをドラッグで移動、ハンドルで期間変更できるインタラクティブなガントチャート
          </p>
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-primary hover:underline">
              GitHub Copilot への指示例
            </summary>
            <div className="mt-2 space-y-2">
              <CodeBlock
                code="@dnd-kit/core を使って[あなたのタスク]をドラッグで移動できるガントチャートを作成。Card コンポーネントで各タスクを表示し、開始日と終了日を視覚的に表示"
                language="text"
                description="プロジェクトのスケジュールやタイムラインを視覚化したい場合に使用します"
              />
              <CodeBlock
                code="DndContext と useSortable フックを使ったガントチャートコンポーネント。各タスクバーの両端にハンドルを配置し、ドラッグで[期間]を変更できるように。Badge コンポーネントで優先度を表示"
                language="text"
                description="インタラクティブなプロジェクト管理ツールを実装する際に活用できます"
              />
            </div>
          </details>
        </div>
      </div>

      <GanttChart />

      </main>
      </div>

      <LinkConfirmModal
        isOpen={modalData.isOpen}
        onClose={closeModal}
        url={modalData.url}
        title={modalData.title}
        description={modalData.description}
      />
    </div>
  )
}
