import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Geek_businessprocessesService } from '@/generated';
import type { Geek_businessprocesses } from '@/generated/models/Geek_businessprocessesModel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Search, 
  FileText, 
  Calendar,
  TrendingUp,
  Folder,
  Trash2
} from 'lucide-react';

export default function ProcessListPage() {
  const navigate = useNavigate();
  const [processes, setProcesses] = useState<Geek_businessprocesses[]>([]);
  const [filteredProcesses, setFilteredProcesses] = useState<Geek_businessprocesses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<Geek_businessprocesses | null>(null);

  useEffect(() => {
    loadProcesses();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProcesses(processes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = processes.filter(
        (p) =>
          p.geek_processname?.toLowerCase().includes(query) ||
          p.geek_description?.toLowerCase().includes(query) ||
          p.geek_processid?.toLowerCase().includes(query)
      );
      setFilteredProcesses(filtered);
    }
  }, [searchQuery, processes]);

  const loadProcesses = async () => {
    setIsLoading(true);
    try {
      const result = await Geek_businessprocessesService.getAll({
        select: ['geek_businessprocessid', 'geek_processname', 'geek_processid', 'geek_description', 'geek_markdowndetails', 'createdon', 'modifiedon'],
        orderBy: ['modifiedon desc'],
        filter: 'statecode eq 0',
      });
      
      if (!result.success) {
        throw new Error(result.error?.message || '取得に失敗しました');
      }
      
      const data = result.data || [];
      console.log('Loaded processes:', data);
      setProcesses(data);
      setFilteredProcesses(data);
      toast.success(`${data.length}件の業務プロセスを読み込みました`);
    } catch (error) {
      console.error('Failed to load processes:', error);
      toast.error('業務プロセスの読み込みに失敗しました');
      setProcesses([]);
      setFilteredProcesses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenProcess = (process: Geek_businessprocesses) => {
    // プロセスIDをクエリパラメータとして渡す
    navigate(`/process-editor?id=${process.geek_businessprocessid}`);
  };
  
  const handleDeleteProcess = async (process: Geek_businessprocesses, e: React.MouseEvent) => {
    e.stopPropagation();
    setProcessToDelete(process);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = async () => {
    if (!processToDelete) return;
    
    try {
      if (!processToDelete.geek_businessprocessid) {
        toast.error('IDが見つかりません');
        setShowDeleteDialog(false);
        return;
      }
      
      await Geek_businessprocessesService.delete(processToDelete.geek_businessprocessid);
      
      toast.success('プロセスを削除しました');
      setShowDeleteDialog(false);
      setProcessToDelete(null);
      loadProcesses();
    } catch (error) {
      console.error('削除エラー:', error);
      toast.error('プロセスの削除に失敗しました');
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '不明';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRecentProcesses = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return processes.filter(
      (p) => p.createdon && new Date(p.createdon) > oneWeekAgo
    ).length;
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">業務プロセス</h1>
            <p className="text-muted-foreground mt-1">
              登録されている業務プロセスの一覧を表示します
            </p>
          </div>
          <Button onClick={() => navigate('/process-editor')} size="lg">
            <FileText className="h-4 w-4 mr-2" />
            新規作成
          </Button>
        </div>
      </div>

      {/* 概要カード */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総プロセス数</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : processes.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              登録されている業務プロセス
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">検索結果</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                filteredProcesses.length
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery ? `"${searchQuery}" の検索結果` : '全件表示中'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最近の追加</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : getRecentProcesses()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">過去7日間</p>
          </CardContent>
        </Card>
      </div>

      {/* 検索バー */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="プロセス名、説明、プロセスIDで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* ギャラリー */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProcesses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery
                ? '検索結果がありません'
                : '業務プロセスが登録されていません'}
            </h3>
            <p className="text-muted-foreground text-center">
              {searchQuery
                ? '検索条件を変更してお試しください'
                : 'デザイナーで新しい業務プロセスを作成できます'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProcesses.map((process) => (
            <Card
              key={process.geek_businessprocessid}
              className="transition-all hover:shadow-lg hover:border-primary"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">
                    {process.geek_processname || '無題'}
                  </CardTitle>
                  {process.geek_processid && (
                    <Badge variant="secondary" className="shrink-0">
                      {process.geek_processid}
                    </Badge>
                  )}
                </div>
                {process.geek_description && (
                  <CardDescription className="line-clamp-2">
                    {process.geek_description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>作成: {formatDate(process.createdon)}</span>
                </div>
                {process.modifiedon && process.modifiedon !== process.createdon && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>更新: {formatDate(process.modifiedon)}</span>
                  </div>
                )}
                {process.geek_markdowndetails && (
                  <div className="text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 inline mr-1" />
                    定義済み
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => handleOpenProcess(process)} 
                    className="flex-1"
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    編集
                  </Button>
                  <Button 
                    onClick={(e) => handleDeleteProcess(process, e)} 
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* 削除確認ダイアログ */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>プロセスを削除</DialogTitle>
            <DialogDescription>
              「{processToDelete?.geek_processname || '無題'}」を削除しますか？この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                setProcessToDelete(null);
              }}
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
