import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useFlowchartStore } from '@/stores/flowchart-store';
import type { Report } from '@/types/flowchart';

interface ReportEditorDialogProps {
  report: Report;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportEditorDialog({
  report,
  open,
  onOpenChange,
}: ReportEditorDialogProps) {
  const { process, updateReport } = useFlowchartStore();
  const [name, setName] = useState(report.name);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>(report.relatedNodeIds || []);

  useEffect(() => {
    if (open) {
      setName(report.name);
      setSelectedNodeIds(report.relatedNodeIds || []);
    }
  }, [open, report]);

  const handleSave = () => {
    updateReport(report.id, {
      name,
      relatedNodeIds: selectedNodeIds,
    });
    onOpenChange(false);
  };

  const toggleNodeSelection = (nodeId: string) => {
    setSelectedNodeIds((prev) => {
      if (prev.includes(nodeId)) {
        return prev.filter((id) => id !== nodeId);
      } else {
        return [...prev, nodeId];
      }
    });
  };

  const getNodeLabel = (nodeId: string) => {
    const node = process?.nodes.find((n) => n.id === nodeId);
    return node?.label || nodeId;
  };

  const getSwimlaneLabel = (nodeId: string) => {
    const node = process?.nodes.find((n) => n.id === nodeId);
    if (!node) return '';
    const swimlane = process?.swimlanes.find((s) => s.id === node.swimlaneId);
    return swimlane?.name || '';
  };
  
  // 他の帳票に紐付けられているノードをチェック
  const getNodeStatus = (nodeId: string) => {
    const node = process?.nodes.find((n) => n.id === nodeId);
    if (!node) return { disabled: false, reason: '' };
    
    // 現在編集中の帳票以外で、同じ行に紐付けられている帳票を検索
    const otherReport = process?.reports?.find(r => 
      r.id !== report.id && 
      (r.relatedNodeIds || []).some(relatedNodeId => {
        const relatedNode = process.nodes.find(n => n.id === relatedNodeId);
        return relatedNode && relatedNode.row === node.row;
      })
    );
    
    if (otherReport) {
      return { disabled: true, reason: `${otherReport.name}に関連付けられています` };
    }
    
    return { disabled: false, reason: '' };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>帳票編集</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div className="space-y-2">
            <Label htmlFor="report-name">帳票名</Label>
            <Input
              id="report-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 購買申請書"
            />
          </div>

          <div className="space-y-2">
            <Label>関連するプロセス</Label>
            <div className="border rounded-md p-3 space-y-2 max-h-[300px] overflow-y-auto">
              {process?.nodes && process.nodes.length > 0 ? (
                process.nodes
                  .filter((node) => node.type !== 'start' && node.type !== 'end')
                  .map((node) => {
                    const status = getNodeStatus(node.id);
                    return (
                      <div key={node.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`node-${node.id}`}
                          checked={selectedNodeIds.includes(node.id)}
                          onCheckedChange={() => !status.disabled && toggleNodeSelection(node.id)}
                          disabled={status.disabled}
                        />
                        <label
                          htmlFor={`node-${node.id}`}
                          className={`text-sm flex-1 ${status.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        >
                          <div className="font-medium">{getNodeLabel(node.id)}</div>
                          <div className="text-xs text-muted-foreground">
                            {getSwimlaneLabel(node.id)} - 行 {(node.row ?? 0) + 1}
                            {status.disabled && (
                              <span className="ml-2 text-orange-600">(※ {status.reason})</span>
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  プロセスが存在しません
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              選択中: {selectedNodeIds.length} 個のプロセス
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
