import { useState } from 'react';
import { useFlowchartStore } from '@/stores/flowchart-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Trash2, 
  Edit, 
  ChevronDown, 
  ChevronRight,
  ChevronUp,
  Square,
  Diamond,
  Circle,
  FileText,
  Layers,
  GripVertical,
  Server,
  ClipboardList
} from 'lucide-react';
import type { NodeType, Swimlane, FlowNode } from '@/types/flowchart';
import { NodeEditorDialog } from './node-editor-dialog';
import { SystemEditorDialog } from './system-editor-dialog';
import { ReportEditorDialog } from './report-editor-dialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableSwimlaneItemProps {
  swimlane: Swimlane;
  index: number;
  updateSwimlane: (id: string, updates: Partial<Swimlane>) => void;
  removeSwimlane: (id: string) => void;
  moveSwimlane: (id: string, direction: 'up' | 'down') => void;
  totalCount: number;
}

function SortableSwimlaneItem({
  swimlane,
  index,
  updateSwimlane,
  removeSwimlane,
  moveSwimlane,
  totalCount,
}: SortableSwimlaneItemProps) {
  const isEditing = true; // 常に編集モード
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: swimlane.id, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 rounded border"
      {...attributes}
    >
      {isEditing && (
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing flex items-center"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <span className="text-xs text-muted-foreground">{index + 1}</span>
      <Input
        value={swimlane.name}
        onChange={(e) => updateSwimlane(swimlane.id, { name: e.target.value })}
        className={`h-7 text-sm flex-1 ${isEditing ? 'bg-background' : ''}`}
        disabled={!isEditing}
        style={!isEditing ? { backgroundColor: swimlane.color, color: '#000000' } : undefined}
      />
      {isEditing && (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => moveSwimlane(swimlane.id, 'up')}
            disabled={index === 0}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => moveSwimlane(swimlane.id, 'down')}
            disabled={index === totalCount - 1}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => removeSwimlane(swimlane.id)}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function ProcessEditorPanel() {
  const isEditing = true; // 常に編集モード
  const { 
    process, 
    addSwimlane, 
    removeSwimlane, 
    updateSwimlane,
    moveSwimlane,
    reorderSwimlanes,
    addNode,
    removeNode,
    updateNode,
    selectedNodeId,
    setSelectedNode,
    addSystem,
    updateSystem,
    removeSystem,
    selectedSystemId,
    setSelectedSystem,
    addReport,
    updateReport,
    removeReport,
    selectedReportId,
    setSelectedReport,
    editingNodeId,
    setEditingNodeId,
  } = useFlowchartStore();
  
  const [newSwimlaneName, setNewSwimlaneName] = useState('');
  const [newSystemName, setNewSystemName] = useState('');
  const [newReportName, setNewReportName] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    swimlanes: true,
    nodes: true,
    systems: true,
    reports: true,
  });
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && process) {
      const oldIndex = process.swimlanes.findIndex((s) => s.id === active.id);
      const newIndex = process.swimlanes.findIndex((s) => s.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newSwimlanes = arrayMove(process.swimlanes, oldIndex, newIndex);
        reorderSwimlanes(newSwimlanes);
      }
    }
  };
  
  if (!process) {
    return (
      <div className="p-4 text-muted-foreground text-sm">
        プロセスを作成してください
      </div>
    );
  }
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const handleAddSwimlane = () => {
    if (newSwimlaneName.trim()) {
      addSwimlane(newSwimlaneName.trim());
      setNewSwimlaneName('');
    }
  };
  
  const handleAddNode = (type: NodeType) => {
    if (process.swimlanes.length === 0) {
      alert('先にスイムレーン（担当部門）を追加してください');
      return;
    }
    const maxRow = Math.max(...process.nodes.map(n => n.row), -1);
    addNode({
      type,
      label: `新規${getNodeTypeLabel(type)}`,
      swimlaneId: process.swimlanes[0].id,
      row: maxRow + 1,
    });
  };
  
  const getNodeTypeIcon = (type: NodeType) => {
    switch (type) {
      case 'process': return <Square className="h-4 w-4" />;
      case 'decision': return <Diamond className="h-4 w-4" />;
      case 'start': 
      case 'end': return <Circle className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'subprocess': return <Layers className="h-4 w-4" />;
      default: return <Square className="h-4 w-4" />;
    }
  };
  
  const getNodeTypeLabel = (type: NodeType) => {
    switch (type) {
      case 'process': return 'プロセス';
      case 'decision': return '判断';
      case 'start': return '開始';
      case 'end': return '終了';
      case 'document': return 'ドキュメント';
      case 'subprocess': return 'サブプロセス';
      default: return 'プロセス';
    }
  };

  const editingNode = editingNodeId ? process.nodes.find(n => n.id === editingNodeId) : null;
  
  return (
    <div className="h-full overflow-y-auto">
      {/* スイムレーン */}
      <div className="border-b">
        <button
          className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('swimlanes')}
        >
          <span className="font-medium text-sm">スイムレーン（担当部門）</span>
          {expandedSections.swimlanes ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {expandedSections.swimlanes && (
          <div className="px-3 pb-3 space-y-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={process.swimlanes.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {process.swimlanes.map((swimlane, index) => (
                  <SortableSwimlaneItem
                    key={swimlane.id}
                    swimlane={swimlane}
                    index={index}
                    updateSwimlane={updateSwimlane}
                    removeSwimlane={removeSwimlane}
                    moveSwimlane={moveSwimlane}
                    totalCount={process.swimlanes.length}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="新しい部門名"
                  value={newSwimlaneName}
                  onChange={(e) => setNewSwimlaneName(e.target.value)}
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSwimlane()}
                />
                <Button size="sm" onClick={handleAddSwimlane}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* ノード追加 */}
      {isEditing && (
        <div className="p-3 border-b">
          <Label className="text-sm font-medium mb-2 block">ノード追加</Label>
          <div className="grid grid-cols-3 gap-1">
            {(['process', 'decision', 'document'] as NodeType[]).map(type => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleAddNode(type)}
              >
                {getNodeTypeIcon(type)}
                <span className="ml-1">{getNodeTypeLabel(type)}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* ノード一覧 */}
      <div className="border-b">
        <button
          className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('nodes')}
        >
          <span className="font-medium text-sm">ノード一覧 ({process.nodes.length})</span>
          {expandedSections.nodes ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {expandedSections.nodes && (
          <div className="px-3 pb-3 space-y-1 max-h-[300px] overflow-y-auto">
            {process.nodes
              .sort((a, b) => a.row - b.row)
              .map((node) => {
                const swimlane = process.swimlanes.find(s => s.id === node.swimlaneId);
                return (
                  <div
                    key={node.id}
                    className={`
                      flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors
                      ${selectedNodeId === node.id ? 'bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-700' : 'hover:bg-muted/50'}
                    `}
                    onClick={() => setSelectedNode(node.id)}
                  >
                    {getNodeTypeIcon(node.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{node.label}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {swimlane?.name || '未割当'} - 行{node.row + 1}
                      </div>
                    </div>
                    {isEditing && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNodeId(node.id);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNode(node.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
      
      {/* 関連システム */}
      <div>
        <button
          className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('systems')}
        >
          <span className="font-medium text-sm">関連システム ({process.relatedSystems?.length || 0})</span>
          {expandedSections.systems ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {expandedSections.systems && (
          <div className="px-3 pb-3 space-y-2">
            {(process.relatedSystems || []).map((system) => (
              <div 
                key={system.id} 
                className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                  selectedSystemId === system.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedSystem(system.id)}
              >
                <Server className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  {isEditing && selectedSystemId === system.id ? (
                    <Input
                      value={system.name}
                      onChange={(e) => updateSystem(system.id, { name: e.target.value })}
                      className="h-7 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="text-sm truncate">{system.name}</div>
                  )}
                  {system.relatedNodeIds && system.relatedNodeIds.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {system.relatedNodeIds.length} 個のノードに関連
                    </div>
                  )}
                </div>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSystem(system.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            {isEditing && (
              <div className="space-y-2 pt-2 border-t">
                <Input
                  placeholder="システム名"
                  value={newSystemName}
                  onChange={(e) => setNewSystemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSystemName.trim()) {
                      addSystem({ name: newSystemName.trim(), relatedNodeIds: [] });
                      setNewSystemName('');
                    }
                  }}
                  className="h-8 text-sm"
                />
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    if (newSystemName.trim()) {
                      addSystem({ name: newSystemName.trim(), relatedNodeIds: [] });
                      setNewSystemName('');
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  追加
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 帳票 */}
      <div>
        <button
          className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('reports')}
        >
          <span className="font-medium text-sm">帳票 ({process.reports?.length || 0})</span>
          {expandedSections.reports ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {expandedSections.reports && (
          <div className="px-3 pb-3 space-y-2">
            {(process.reports || []).map((report) => (
              <div 
                key={report.id} 
                className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                  selectedReportId === report.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedReport(report.id)}
              >
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  {isEditing && selectedReportId === report.id ? (
                    <Input
                      value={report.name}
                      onChange={(e) => updateReport(report.id, { name: e.target.value })}
                      className="h-7 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="text-sm truncate">{report.name}</div>
                  )}
                  {report.relatedNodeIds && report.relatedNodeIds.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {report.relatedNodeIds.length} 個のノードに関連
                    </div>
                  )}
                </div>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeReport(report.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            {isEditing && (
              <div className="space-y-2 pt-2 border-t">
                <Input
                  placeholder="帳票名"
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newReportName.trim()) {
                      addReport({ name: newReportName.trim(), relatedNodeIds: [] });
                      setNewReportName('');
                    }
                  }}
                  className="h-8 text-sm"
                />
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    if (newReportName.trim()) {
                      addReport({ name: newReportName.trim(), relatedNodeIds: [] });
                      setNewReportName('');
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  追加
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* ノード編集ダイアログ */}
      {editingNode && (
        <NodeEditorDialog
          node={editingNode}
          swimlanes={process.swimlanes}
          open={!!editingNodeId}
          onOpenChange={(open: boolean) => !open && setEditingNodeId(null)}
          onSave={(updates: Partial<FlowNode>) => {
            updateNode(editingNode.id, updates);
            setEditingNodeId(null);
          }}
        />
      )}
      
      {/* システム編集ダイアログ */}
      {selectedSystemId && (
        <SystemEditorDialog
          system={process.relatedSystems?.find(s => s.id === selectedSystemId)!}
          open={!!selectedSystemId}
          onOpenChange={(open: boolean) => !open && setSelectedSystem(null)}
        />
      )}
      
      {/* 帳票編集ダイアログ */}
      {selectedReportId && (
        <ReportEditorDialog
          report={process.reports?.find(r => r.id === selectedReportId)!}
          open={!!selectedReportId}
          onOpenChange={(open: boolean) => !open && setSelectedReport(null)}
        />
      )}
    </div>
  );
}
