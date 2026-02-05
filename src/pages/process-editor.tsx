import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate, useBlocker } from 'react-router-dom';
import { useFlowchartStore } from '@/stores/flowchart-store';
import { SwimlaneDiagram } from '@/components/business-process/swimlane-diagram';
import { ProcessEditorPanel } from '@/components/business-process/process-editor-panel';
import { parseProcessMarkdown, exportProcessToMarkdown, SAMPLE_MARKDOWN } from '@/components/business-process/markdown-parser';
import { COPILOT_PROMPT } from '@/components/copilot-prompt-button';
import { Geek_businessprocessesService } from '@/generated';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  FileText, 
  Code,
  LayoutDashboard,
  PanelRightOpen,
  PanelRightClose,
  FileDown,
  Database,
  Eye,
  Trash2,
  Home,
  BookOpen,
  Edit,
  ExternalLink,
  Link,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProcessEditorPage() {
  const { process, setProcess, createNewProcess, updateProcessTitle } = useFlowchartStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 状態変数の宣言
  const [showSidebar, setShowSidebar] = useState(true);
  const [markdownInput, setMarkdownInput] = useState('');
  const [showMarkdownDialog, setShowMarkdownDialog] = useState(false);
  const [showNewProcessDialog, setShowNewProcessDialog] = useState(false);
  const [newProcessTitle, setNewProcessTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'visual' | 'markdown'>('visual');
  const [markdownEdit, setMarkdownEdit] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [initialProcessJson, setInitialProcessJson] = useState<string>('');
  
  // URLパラメータからプロセスを読み込み
  useEffect(() => {
    const processId = searchParams.get('id');
    if (processId) {
      loadProcessById(processId);
    } else {
      // 新規作成時は空のプロセスを作成
      const emptyProcess = {
        id: undefined,
        title: '',
        description: '',
        documentUrl: '',
        swimlanes: [],
        nodes: [],
        edges: [],
        departments: [],
        processes: [],
        reports: [],
        systems: [],
      };
      setProcess(emptyProcess);
      setMarkdownEdit('');
      setInitialProcessJson(JSON.stringify(emptyProcess));
      setIsDirty(false);
    }
  }, [searchParams]);

  const loadProcessById = async (id: string) => {
    try {
      const result = await Geek_businessprocessesService.get(id, {
        select: ['geek_businessprocessid', 'geek_processname', 'geek_processid', 'geek_description', 'geek_documenturl', 'geek_markdowndetails', 'createdon', 'modifiedon'],
      });
      
      if (!result.success) {
        toast.error('指定されたプロセスが見つかりません');
        return;
      }
      
      const targetProcess = result.data;
      
      if (targetProcess && targetProcess.geek_markdowndetails) {
        const parsed = parseProcessMarkdown(targetProcess.geek_markdowndetails);
        // IDを保持
        setProcess({
          ...parsed,
          id: targetProcess.geek_businessprocessid,
          title: targetProcess.geek_processname || parsed.title,
          description: targetProcess.geek_description || parsed.description,
          documentUrl: targetProcess.geek_documenturl || '',
        });
        // 初期状態を保存
        setInitialProcessJson(JSON.stringify({
          ...parsed,
          id: targetProcess.geek_businessprocessid,
          title: targetProcess.geek_processname || parsed.title,
          description: targetProcess.geek_description || parsed.description,
          documentUrl: targetProcess.geek_documenturl || '',
        }));
        toast.success('プロセスを読み込みました');
      } else if (targetProcess) {
        // マークダウンがない場合は基本情報のみ設定
        createNewProcess(targetProcess.geek_processname || '無題');
        // 少し待ってから更新（createNewProcessが完了するのを待つ）
        setTimeout(() => {
          if (process) {
            setProcess({
              ...process,
              id: targetProcess.geek_businessprocessid,
              description: targetProcess.geek_description,
            });
          }
        }, 0);
      }
    } catch (error) {
      console.error('プロセス読み込みエラー:', error);
      toast.error('プロセスの読み込みに失敗しました');
    }
  };
  
  // デバッグ用：プロセスの状態を監視
  useEffect(() => {
    console.log('現在のプロセス:', process);
  }, [process]);
  
  // プロセスが変更されたらisDirtyをチェック
  useEffect(() => {
    if (process && initialProcessJson) {
      const currentJson = JSON.stringify(process);
      setIsDirty(currentJson !== initialProcessJson);
    }
  }, [process, initialProcessJson]);
  
  // ナビゲーションをブロック
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );
  
  // ブロッカーがアクティブになったらダイアログを表示
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowUnsavedDialog(true);
    }
  }, [blocker.state]);
  
  // プロセスが変更されたらマークダウンを更新
  useEffect(() => {
    if (process) {
      const md = exportProcessToMarkdown(process);
      setMarkdownEdit(md);
    }
  }, [process]);
  
  // マークダウン編集のフォーカスが外れた時に保存
  const handleMarkdownBlur = useCallback(() => {
    try {
      const parsed = parseProcessMarkdown(markdownEdit);
      // 既存のIDを保持
      setProcess({
        ...parsed,
        id: process?.id || parsed.id,
        documentUrl: process?.documentUrl || parsed.documentUrl,
      });
    } catch (error) {
      // パースエラーは無視（編集中は不完全な状態があり得る）
    }
  }, [markdownEdit, process?.id, process?.documentUrl, setProcess]);
  
  // マークダウンからプロセスを読み込み
  const handleParseMarkdown = useCallback(() => {
    try {
      console.log('パース開始:', markdownInput);
      const parsed = parseProcessMarkdown(markdownInput);
      console.log('パース結果:', parsed);
      console.log('スイムレーン数:', parsed.swimlanes.length);
      console.log('ノード数:', parsed.nodes.length);
      setProcess(parsed);
      setInitialProcessJson(JSON.stringify(parsed));
      setShowMarkdownDialog(false);
      setMarkdownInput('');
      toast.success('業務プロセスを読み込みました');
    } catch (error) {
      toast.error('マークダウンのパースに失敗しました');
      console.error('パースエラー:', error);
    }
  }, [markdownInput, setProcess]);
  
  // サンプルを読み込み
  const handleLoadSample = useCallback(() => {
    setMarkdownInput(SAMPLE_MARKDOWN);
  }, []);
  // デザイナー画面から新規作成
  const handleNewProcessClick = useCallback(() => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      // 空のプロセスを作成
      const emptyProcess = {
        id: undefined,
        title: '',
        description: '',
        documentUrl: '',
        swimlanes: [],
        nodes: [],
        edges: [],
        departments: [],
        processes: [],
        reports: [],
        systems: [],
      };
      setProcess(emptyProcess);
      setMarkdownEdit('');
      setInitialProcessJson(JSON.stringify(emptyProcess));
      setIsDirty(false);
      navigate('/process-editor');
      toast.success('新規プロセスを作成しました');
    }
  }, [isDirty, setProcess, navigate]);
  
  // ドキュメントURLを更新
  const handleDocumentUrlChange = useCallback((url: string) => {
    if (process) {
      setProcess({
        ...process,
        documentUrl: url,
      });
    }
  }, [process, setProcess]);
  
  // ドキュメントURLを開く
  const handleOpenDocumentUrl = useCallback(() => {
    if (process?.documentUrl) {
      // URLの検証
      try {
        const url = new URL(process.documentUrl);
        window.open(url.href, '_blank', 'noopener,noreferrer');
      } catch (error) {
        toast.error('無効なURL形式です');
      }
    }
  }, [process?.documentUrl]);
  
  // Copilotプロンプトをクリップボードにコピー
  const handleCopyCopilotPrompt = useCallback(() => {
    navigator.clipboard.writeText(COPILOT_PROMPT)
      .then(() => {
        toast.success('M365 Copilot用プロンプトをコピーしました');
      })
      .catch((error) => {
        console.error('コピーエラー:', error);
        toast.error('クリップボードへのコピーに失敗しました');
      });
  }, []);
  
  // 手動でプロセスを作成（サンプルを読み込む）
  const handleStartManualCreation = useCallback(() => {
    const parsed = parseProcessMarkdown(SAMPLE_MARKDOWN);
    setProcess(parsed);
    setMarkdownEdit(SAMPLE_MARKDOWN);
    setInitialProcessJson(JSON.stringify(parsed));
    setIsDirty(false);
    toast.success('サンプルプロセスを読み込みました。編集してください。');
  }, [setProcess]);
  
  // 新規プロセス作成
  const handleCreateNewProcess = useCallback(() => {
    if (newProcessTitle.trim()) {
      createNewProcess(newProcessTitle.trim());
      setShowNewProcessDialog(false);
      setNewProcessTitle('');
      toast.success('新規プロセスを作成しました');
    }
  }, [newProcessTitle, createNewProcess]);
  
  // マークダウンをクリップボードにコピー
  const handleCopyMarkdown = useCallback(() => {
    if (process) {
      const md = exportProcessToMarkdown(process);
      navigator.clipboard.writeText(md)
        .then(() => {
          toast.success('マークダウンをクリップボードにコピーしました');
        })
        .catch((error) => {
          console.error('コピーエラー:', error);
          toast.error('クリップボードへのコピーに失敗しました');
        });
    }
  }, [process]);
  
  // Dataverseに保存
  const handleSaveToDataverse = useCallback(async () => {
    if (!process) {
      toast.error('保存するプロセスがありません');
      return;
    }

    try {
      const markdown = exportProcessToMarkdown(process);
      
      // 新規作成または更新
      if (process.id && process.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // 既存レコードを更新
        const result = await Geek_businessprocessesService.update(process.id, {
          geek_processname: process.title,
          geek_description: process.description,
          geek_documenturl: process.documentUrl || undefined,
          geek_markdowndetails: markdown,
        });
        
        if (!result.success) {
          throw new Error(result.error?.message || '更新に失敗しました');
        }
        
        toast.success('Dataverseに保存しました');
        setIsDirty(false);
        setInitialProcessJson(JSON.stringify(process));
      } else {
        // 新規作成（ownerid等はDataverseが自動設定）
        const result = await Geek_businessprocessesService.create({
          geek_processname: process.title,
          geek_description: process.description || '',
          geek_documenturl: process.documentUrl || undefined,
          geek_markdowndetails: markdown,
        } as any);
        
        if (!result.success) {
          throw new Error(result.error?.message || '作成に失敗しました');
        }
        
        // 作成されたIDをプロセスに設定
        if (result.data?.geek_businessprocessid) {
          setProcess({
            ...process,
            id: result.data.geek_businessprocessid,
          });
          setInitialProcessJson(JSON.stringify({
            ...process,
            id: result.data.geek_businessprocessid,
          }));
        }
        toast.success('Dataverseに保存しました');
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Dataverse保存エラー:', error);
      toast.error('Dataverseへの保存に失敗しました');
    }
  }, [process, setProcess]);
  
  // プロセスを削除
  const handleDeleteProcess = useCallback(async () => {
    if (!process || !process.id) {
      toast.error('削除するプロセスがありません');
      return;
    }
    
    setShowDeleteDialog(true);
  }, [process]);
  
  const confirmDelete = useCallback(async () => {
    if (!process || !process.id) return;
    try {
      // UUIDフォーマットかどうかを確認
      if (!process.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        toast.error('Dataverseに保存されていないプロセスは削除できません');
        setShowDeleteDialog(false);
        return;
      }
      
      await Geek_businessprocessesService.delete(process.id);
      
      toast.success('プロセスを削除しました');
      setIsDirty(false);
      setShowDeleteDialog(false);
      // ブロッカーをリセットしてから移動
      setTimeout(() => {
        navigate('/process-list');
      }, 0);
    } catch (error) {
      console.error('削除エラー:', error);
      toast.error('プロセスの削除に失敗しました');
      setShowDeleteDialog(false);
    }
  }, [process, navigate]);
  
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* ヘッダー */}
      <div className="flex flex-col gap-3 px-4 py-3 border-b bg-background shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold whitespace-nowrap">業務プロセスデザイナー</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            {process && (
              <Input
                value={process.title}
                onChange={(e) => updateProcessTitle(e.target.value)}
                className="h-9 text-sm w-full min-w-0 lg:w-72"
                placeholder="プロセス名"
              />
            )}
          </div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2">
            {process && process.documentUrl !== undefined && (
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={process.documentUrl || ''}
                    onChange={(e) => handleDocumentUrlChange(e.target.value)}
                    className="h-9 text-sm pl-9"
                    placeholder="関連ドキュメントURL（任意）"
                  />
                </div>
                {process.documentUrl && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleOpenDocumentUrl}
                    className="h-9 shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleNewProcessClick}>
              <FileText className="h-4 w-4 mr-1" />
              新規作成
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setShowMarkdownDialog(true)}>
              <Eye className="h-4 w-4 mr-1" />
              マークダウン読込
            </Button>
            
            {process && (
              <>
                <Button variant="default" size="sm" onClick={handleSaveToDataverse}>
                  <Database className="h-4 w-4 mr-1" />
                  Dataverseに保存
                </Button>
                {process.id && process.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) && (
                  <Button variant="destructive" size="sm" onClick={handleDeleteProcess}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    削除
                  </Button>
                )}
              </>
            )}
          </div>
          </div>
        </div>
      </div>
      
      {/* メインコンテンツ */}
      <div className="flex-1 flex overflow-hidden min-h-0 min-w-0">
        {/* フローチャート/マークダウン表示エリア */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'visual' | 'markdown')} className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
            <TabsList className="mx-4 mt-2 w-fit shrink-0">
              <TabsTrigger value="visual">
                <LayoutDashboard className="h-4 w-4 mr-1" />
                ビジュアル
              </TabsTrigger>
              <TabsTrigger value="markdown">
                <Code className="h-4 w-4 mr-1" />
                マークダウン
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="visual" className="flex-1 m-0 p-4 min-h-0 min-w-0 overflow-hidden">
              {process && process.nodes.length > 0 ? (
                <div className="h-full w-full border rounded-lg overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
                  <SwimlaneDiagram />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="max-w-2xl w-full space-y-8 p-8">
                    <div className="text-center space-y-3">
                      <div className="flex justify-center">
                        <div className="rounded-full bg-primary/10 p-4">
                          <FileText className="h-12 w-12 text-primary" />
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold">業務プロセスデザイナーへようこそ</h2>
                      <p className="text-muted-foreground">
                        以下の方法で業務プロセスの作成を開始できます
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <button
                        onClick={() => navigate('/')}
                        className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-muted hover:border-primary hover:bg-accent transition-colors text-center group"
                      >
                        <div className="rounded-full bg-blue-100 p-3 group-hover:bg-blue-200 transition-colors">
                          <Home className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">使い方を確認</h3>
                          <p className="text-sm text-muted-foreground">
                            ホーム画面で詳しい使い方を確認する
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowMarkdownDialog(true)}
                        className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-muted hover:border-primary hover:bg-accent transition-colors text-center group"
                      >
                        <div className="rounded-full bg-green-100 p-3 group-hover:bg-green-200 transition-colors">
                          <BookOpen className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">マークダウン読込</h3>
                          <p className="text-sm text-muted-foreground">
                            作成済みのマークダウンから開始
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={handleStartManualCreation}
                        className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-muted hover:border-primary hover:bg-accent transition-colors text-center group"
                      >
                        <div className="rounded-full bg-purple-100 p-3 group-hover:bg-purple-200 transition-colors">
                          <Edit className="h-8 w-8 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">手動で作成</h3>
                          <p className="text-sm text-muted-foreground">
                            サンプルを参考に手動で作成
                          </p>
                        </div>
                      </button>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        💡 <strong>Tip:</strong> M365 Copilotを使うと、業務マニュアルから自動でプロセスを生成できます
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="markdown" className="flex-1 m-0 p-4 min-h-0 overflow-hidden">
              <div className="h-full flex flex-col gap-2 min-h-0">
                <div className="flex items-center justify-between shrink-0">
                  <Label>マークダウン編集</Label>
                  {process && (
                    <Button variant="outline" size="sm" onClick={handleCopyMarkdown}>
                      <FileDown className="h-4 w-4 mr-1" />
                      マークダウンのコピー
                    </Button>
                  )}
                </div>
                <Textarea
                  value={markdownEdit}
                  onChange={(e) => setMarkdownEdit(e.target.value)}
                  onBlur={handleMarkdownBlur}
                  className="flex-1 font-mono text-sm min-h-0 overflow-auto"
                  placeholder="プロセスを作成するとマークダウンが表示されます"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* サイドパネル */}
        {showSidebar && (
          <div className="w-80 border-l bg-background overflow-hidden">
            <ProcessEditorPanel />
          </div>
        )}
      </div>
      
      {/* マークダウン読み込みダイアログ */}
      <Dialog open={showMarkdownDialog} onOpenChange={setShowMarkdownDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>マークダウンから業務プロセスを読み込み</DialogTitle>
            <DialogDescription>
              業務プロセスの記述をマークダウン形式で入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={handleLoadSample}>
                <FileText className="h-4 w-4 mr-1" />
                サンプルを読み込む
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyCopilotPrompt}>
                <Copy className="h-4 w-4 mr-1" />
                Copilotプロンプトをコピー
              </Button>
            </div>
            <Textarea
              value={markdownInput}
              onChange={(e) => setMarkdownInput(e.target.value)}
              placeholder={`# BusinessProcessName
購買申請承認プロセス

## Description
従業員が物品やサービスを購入する際の申請から承認、発注、検収までの一連の業務フロー

## Dept
申請者
総務部
承認者

## Process
#P1 #L1 申請者 開始
Next: P2

#P2 #L2 申請者 購買申請書作成
Next: P3

#P3 #L3 総務部 申請内容確認
Yes: P4
No: P2

## Reports
購買申請書 #L: 2

## Systems
購買管理システム #L: 2`}
              className="flex-1 min-h-[300px] max-h-[400px] font-mono text-sm resize-none overflow-y-auto"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMarkdownDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleParseMarkdown} disabled={!markdownInput.trim()}>
              <FileText className="h-4 w-4 mr-1" />
              生成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 新規プロセス作成ダイアログ */}
      <Dialog open={showNewProcessDialog} onOpenChange={setShowNewProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規業務プロセスを作成</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="process-title">プロセス名</Label>
              <Input
                id="process-title"
                value={newProcessTitle}
                onChange={(e) => setNewProcessTitle(e.target.value)}
                placeholder="例: 購買申請フロー"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNewProcess()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProcessDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreateNewProcess} disabled={!newProcessTitle.trim()}>
              作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 未保存変更確認ダイアログ */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>未保存の変更があります</DialogTitle>
            <DialogDescription>
              現在のプロセスに未保存の変更があります。Dataverseに保存しますか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowUnsavedDialog(false);
                blocker.reset?.();
              }}
            >
              キャンセル
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowUnsavedDialog(false);
                setIsDirty(false);
                blocker.proceed?.();
              }}
            >
              保存せずに移動
            </Button>
            <Button 
              onClick={async () => {
                await handleSaveToDataverse();
                setShowUnsavedDialog(false);
                blocker.proceed?.();
              }}
            >
              <Database className="h-4 w-4 mr-1" />
              保存してから移動
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 削除確認ダイアログ */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>プロセスを削除</DialogTitle>
            <DialogDescription>
              「{process?.title}」を削除しますか？この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              キャンセル
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
