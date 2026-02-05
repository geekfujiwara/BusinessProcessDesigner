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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFlowchartStore } from '@/stores/flowchart-store';
import type { FlowNode, Swimlane, NodeType } from '@/types/flowchart';

const NONE_VALUE = '__none__'; // 「なし」を表す特別な値

interface NodeEditorDialogProps {
  node: FlowNode;
  swimlanes: Swimlane[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<FlowNode>) => void;
}

const NODE_TYPES: { value: NodeType; label: string }[] = [
  { value: 'process', label: 'プロセス' },
  { value: 'decision', label: '判断' },
  { value: 'start', label: '開始' },
  { value: 'end', label: '終了' },
];

export function NodeEditorDialog({
  node,
  swimlanes,
  open,
  onOpenChange,
  onSave,
}: NodeEditorDialogProps) {
  const { process, addEdge, removeEdge } = useFlowchartStore();
  const [label, setLabel] = useState(node.label);
  const [description, setDescription] = useState(node.description || '');
  const [type, setType] = useState<NodeType>(node.type);
  const [swimlaneId, setSwimlaneId] = useState(node.swimlaneId);
  const [row, setRow] = useState(node.row + 1); // 表示用に1-indexed
  const [yesTargetId, setYesTargetId] = useState<string>(NONE_VALUE);
  const [noTargetId, setNoTargetId] = useState<string>(NONE_VALUE);
  const [nextTargetId, setNextTargetId] = useState<string>(NONE_VALUE);

  useEffect(() => {
    setLabel(node.label);
    setDescription(node.description || '');
    setType(node.type);
    setSwimlaneId(node.swimlaneId);
    setRow(node.row + 1); // 表示用に1-indexed
    
    // 判断ノードの場合、既存のYES/NOエッジを取得
    if (process && node.type === 'decision') {
      const yesEdge = process.edges.find(e => e.source === node.id && e.label === 'YES');
      const noEdge = process.edges.find(e => e.source === node.id && e.label === 'NO');
      setYesTargetId(yesEdge?.target || NONE_VALUE);
      setNoTargetId(noEdge?.target || NONE_VALUE);
      setNextTargetId(NONE_VALUE);
    } else if (process) {
      // 通常ノードの場合、既存の接続先を取得
      const nextEdge = process.edges.find(e => e.source === node.id && !e.label);
      setNextTargetId(nextEdge?.target || NONE_VALUE);
      setYesTargetId(NONE_VALUE);
      setNoTargetId(NONE_VALUE);
    } else {
      setYesTargetId(NONE_VALUE);
      setNoTargetId(NONE_VALUE);
      setNextTargetId(NONE_VALUE);
    }
  }, [node, process]);

  const handleSave = () => {
    onSave({
      label,
      description: description || undefined,
      type,
      swimlaneId,
      row: row - 1, // 内部的には0-indexedで保存
    });
    
    if (!process) return;
    
    // 判断ノードの場合、YES/NOエッジを更新
    if (type === 'decision') {
      // 既存のYES/NOエッジを削除
      const existingYesEdge = process.edges.find(e => e.source === node.id && e.label === 'YES');
      const existingNoEdge = process.edges.find(e => e.source === node.id && e.label === 'NO');
      const existingNextEdge = process.edges.find(e => e.source === node.id && !e.label);
      
      if (existingYesEdge) removeEdge(existingYesEdge.id);
      if (existingNoEdge) removeEdge(existingNoEdge.id);
      if (existingNextEdge) removeEdge(existingNextEdge.id);
      
      // 新しいYESエッジを追加
      if (yesTargetId && yesTargetId !== NONE_VALUE) {
        addEdge({
          source: node.id,
          target: yesTargetId,
          label: 'YES',
          type: 'approval',
        });
      }
      
      // 新しいNOエッジを追加
      if (noTargetId && noTargetId !== NONE_VALUE) {
        addEdge({
          source: node.id,
          target: noTargetId,
          label: 'NO',
          type: 'rejection',
        });
      }
    } else {
      // 通常ノードの場合、Nextエッジを更新
      // 既存のYES/NO/Nextエッジを削除
      const existingYesEdge = process.edges.find(e => e.source === node.id && e.label === 'YES');
      const existingNoEdge = process.edges.find(e => e.source === node.id && e.label === 'NO');
      const existingNextEdge = process.edges.find(e => e.source === node.id && !e.label);
      
      if (existingYesEdge) removeEdge(existingYesEdge.id);
      if (existingNoEdge) removeEdge(existingNoEdge.id);
      if (existingNextEdge) removeEdge(existingNextEdge.id);
      
      // 新しいNextエッジを追加
      if (nextTargetId && nextTargetId !== NONE_VALUE) {
        addEdge({
          source: node.id,
          target: nextTargetId,
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>ノードを編集</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-1">
          <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="label">ラベル</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ノードのラベル"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">説明（任意）</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ノードの詳細説明"
              rows={2}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="type">ノードタイプ</Label>
            <Select value={type} onValueChange={(v) => setType(v as NodeType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NODE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="swimlane">担当部門</Label>
            <Select value={swimlaneId} onValueChange={setSwimlaneId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {swimlanes.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="row">行番号</Label>
            <Input
              id="row"
              type="number"
              min={1}
              value={row}
              onChange={(e) => setRow(parseInt(e.target.value) || 1)}
            />
          </div>
          
          {type === 'decision' && process && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="yes-target">YES分岐先</Label>
                <Select value={yesTargetId} onValueChange={setYesTargetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="分岐先を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>なし</SelectItem>
                    {process.nodes
                      .filter(n => n.id !== node.id)
                      .sort((a, b) => a.row - b.row)
                      .map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.label} (行{n.row + 1})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="no-target">NO分岐先</Label>
                <Select value={noTargetId} onValueChange={setNoTargetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="分岐先を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>なし</SelectItem>
                    {process.nodes
                      .filter(n => n.id !== node.id)
                      .sort((a, b) => a.row - b.row)
                      .map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.label} (行{n.row + 1})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          {type !== 'decision' && type !== 'end' && process && (
            <div className="grid gap-2">
              <Label htmlFor="next-target">接続先</Label>
              <Select value={nextTargetId} onValueChange={setNextTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder="接続先を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>なし</SelectItem>
                  {process.nodes
                    .filter(n => n.id !== node.id)
                    .sort((a, b) => a.row - b.row)
                    .map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.label} (行{n.row + 1})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        </div>
        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
