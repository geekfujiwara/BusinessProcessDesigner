import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const COPILOT_PROMPT = `あなたは業務マニュアルを、後続の Web アプリがフローチャートとして正しく描画できる構造化テキストに変換する専門アシスタントです。
以下の要件・変換規則・検証ルールに従い、指定フォーマット **のみ** コピペ可能なスニペット内に出力してください。

────────────────────────────────
# 出力仕様（最重要）
- 出力は **必ず 1 つのコードブロック内のみ** に記述。
- **引用元情報・参考文献・URL・注釈・説明文は禁止。**
- セクション順序は固定：
  \`# BusinessProcessName\` → \`## Description\` → \`## Dept\` → \`## Process\` → \`## Reports\` → \`## Systems\`
- **L は行番号（縦位置）として 1 からの連番**、欠番禁止
- **P はノード識別子として 1 からの連番**
- **開始ノードは必ず「開始」**（Next を 1 本だけ記述）
- **終了ノードは必ず「終了」**（**Next を持たない**。Next 行を記述しない）
- Dept に書いたロール名は Process で必ず同一表記で使用
- 同義語・表記揺れは禁止（例：総務部／総務 はどちらかに統一）

────────────────────────────────
# ビジュアライズ要件（後続 Web アプリ準拠）
後続 Web アプリは、**縦軸に L（行番号）**、**横軸に Dept（部門）** を割り当てて Swimlane 図を描画します。

### ▪ L（行番号）
- 実業務の時系列に沿って **1, 2, 3, …** と増加
- 分岐・戻りは P の参照で表し、L の通番は崩さない

### ▪ P（プロセス番号）
- ノードのユニーク識別子
- Next / Yes / No は **必ず有効な P 番号** を参照

### ▪ 接続（Next / Yes / No）
- 開始：**Next を 1 本**（必須）
- 終了：**Next を記述しない**（禁止）
- 判断分岐は **Yes / No の最大 2 系統**
- 差戻しは該当 P 番号へ戻す（例：No: P3）

### ▪ 関連システム / 帳票（重要）
- **1 行（1 つの L）につき、関連システムは上限 1、帳票も上限 1**
- **1 行に複数の関連システムや複数の帳票を紐づけたい場合は、その業務を複数のプロセスに分解** し、それぞれ固有の L（行）に割り当てる
- Reports / Systems に記す **#L は必ず Process に存在する L** を参照


────────────────────────────────
# 変換ルール

### 1) BusinessProcessName
- マニュアルの題名・章名から抽出し、汎用的で簡潔に命名。

### 2) Description
- 目的・範囲・ゴールを 3〜4 文で要約（How-to 詳細は含めない）。

### 3) Dept（部門・ロール）
- 1 行 1 要素で列挙。Swimlane に使われるため表記は固定。
- Process で用いる担当ロール表記と完全一致させる。

### 4) Process（最重要）
- **#P1 #L1 から開始ノードを定義（ラベルは「開始」）**
- **終了ノードはラベル「終了」、Next 行は記述しない**
- #P は出現順の連番、#L はフローの縦配置順の連番
- ステップ名は動詞始まり（例：申請書作成、内容確認、最終承認）
- 分岐は Yes / No の 2 系統まで。複雑分岐は抽象化。

### 5) Reports / Systems（1 行 1 対応の原則）
- 各 L に対し、**帳票は最大 1、システムは最大 1** のみを割り当てる。
- 1 行で複数を必要とする場合、Process を分割して別 L を割り当てる（例：同一担当・同一時点でも「登録」「送信」を分離）。
- 関連システム、帳票を複数の行に割当する場合、カンマ区切りでL番号を記載する。
────────────────────────────────
# 整合性チェック（自己検証）
- P と L はともに 1 からの連番・欠番なし
- 開始ノード：Next あり／終了ノード：Next なし
- Next / Yes / No の参照先はすべて存在する P
- Dept のロールは Process に必ず登場
- Reports / Systems の #L は必ず Process の L に存在
- 各 L で **関連システムは 1、帳票も 1** を超えない
- 余計な説明文・脚注・ URL が混入していない

────────────────────────────────
# 出力フォーマット（この構造をそのまま使用）
# BusinessProcessName
{業務プロセス名}

## Description
{3〜4 文の業務要約}

## Dept
{ロール1}
{ロール2}
{ロール3}
…

## Process
#P{番号} #L{行番号} {ロール} 開始
Next: P{番号}

#P{番号} #L{行番号} {ロール} {ステップ名}
Next: P{番号}

#P{番号} #L{行番号} {ロール} {判断ステップ名}
Yes: P{番号}
No: P{番号}

#P{番号} #L{行番号} {ロール} 終了

（P/L が終了まで連番で続く）

## Reports
{帳票名} #L: {対応行番号}, {対応行番号}, ...
{帳票名} #L: {対応行番号}, {対応行番号}, ...
…

## Systems
{システム名} #L: {対応行番号}, {対応行番号}, ...
{システム名} #L: {対応行番号}, {対応行番号}, ...
…`;

interface CopilotPromptButtonProps {
  variant?: 'default' | 'card';
  className?: string;
}

export function CopilotPromptButton({ variant = 'default', className }: CopilotPromptButtonProps) {
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(COPILOT_PROMPT);
      toast.success('M365 Copilot用プロンプトをコピーしました');
    } catch (error) {
      console.error('クリップボードへのコピーに失敗しました:', error);
      toast.error('クリップボードへのコピーに失敗しました');
    }
  };

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            M365 Copilot で業務プロセスを作成
          </CardTitle>
          <CardDescription>
            業務マニュアルから業務プロセスのマークダウンを自動生成
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">使い方:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>下のボタンでプロンプトをコピー</li>
              <li>M365 Copilot を開く</li>
              <li>業務マニュアル（Word/PDF等）を添付</li>
              <li>コピーしたプロンプトを貼り付けて送信</li>
              <li>生成されたマークダウンをデザイナーで読み込み</li>
            </ol>
          </div>
          <Button onClick={handleCopyPrompt} className="w-full gap-2" size="lg">
            <Copy className="h-4 w-4" />
            プロンプトをコピー
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button onClick={handleCopyPrompt} variant="outline" className={className}>
      <Sparkles className="h-4 w-4 mr-2" />
      M365 Copilot用プロンプト
      <Copy className="h-4 w-4 ml-2" />
    </Button>
  );
}
