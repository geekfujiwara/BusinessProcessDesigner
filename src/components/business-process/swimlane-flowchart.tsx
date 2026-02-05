import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeTypes,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowchartStore } from '@/stores/flowchart-store';
import { ProcessNode } from './nodes/process-node';
import { DecisionNode } from './nodes/decision-node';
import { DocumentNode } from './nodes/document-node';
import { StartEndNode } from './nodes/start-end-node';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

// カスタムノードタイプ
const nodeTypes: NodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  document: DocumentNode,
  start: StartEndNode,
  end: StartEndNode,
  subprocess: ProcessNode,
};

// スイムレーンの幅と行の高さ
const SWIMLANE_WIDTH = 150;
const ROW_HEIGHT = 100;
const HEADER_HEIGHT = 50;
const ROW_NUMBER_WIDTH = 40;
const DOCUMENT_COLUMN_WIDTH = 150;

interface SwimlaneFlowchartProps {
  onExportMarkdown?: () => void;
  onExportSvg?: () => void;
}

export function SwimlaneFlowchart({ onExportMarkdown, onExportSvg }: SwimlaneFlowchartProps) {
  const { process, addEdge: addFlowEdge, setSelectedNode, selectedNodeId } = useFlowchartStore();
  
  // ReactFlowのノードとエッジに変換
  const { nodes: flowNodes, edges: flowEdges, swimlaneBackgrounds, rowCount } = useMemo(() => {
    if (!process) {
      return { nodes: [], edges: [], swimlaneBackgrounds: [], rowCount: 0 };
    }

    const maxRow = Math.max(
      ...process.nodes.map(n => n.row),
      ...(process.relatedDocuments || []).map(d => d.row ?? 0),
      9
    );

    // スイムレーン背景ノード
    const backgrounds: Node[] = process.swimlanes.map((swimlane, index) => ({
      id: `swimlane-bg-${swimlane.id}`,
      type: 'group',
      position: { x: ROW_NUMBER_WIDTH + index * SWIMLANE_WIDTH, y: HEADER_HEIGHT },
      data: { label: swimlane.name },
      style: {
        width: SWIMLANE_WIDTH,
        height: (maxRow + 1) * ROW_HEIGHT,
        backgroundColor: swimlane.color,
        border: '1px solid #ddd',
        borderRadius: 0,
        zIndex: -1,
      },
      selectable: false,
      draggable: false,
    }));

    // プロセスノード
    const nodes: Node[] = process.nodes.map((node) => {
      const swimlaneIndex = process.swimlanes.findIndex(s => s.id === node.swimlaneId);
      const x = ROW_NUMBER_WIDTH + swimlaneIndex * SWIMLANE_WIDTH + SWIMLANE_WIDTH / 2;
      const y = HEADER_HEIGHT + node.row * ROW_HEIGHT + ROW_HEIGHT / 2;

      return {
        id: node.id,
        type: node.type,
        position: { x: x - 50, y: y - 25 },
        data: { 
          label: node.label,
          description: node.description,
          nodeType: node.type,
          isSelected: node.id === selectedNodeId,
        },
        draggable: true,
      };
    });

    // エッジ
    const edges: Edge[] = process.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { 
        stroke: edge.type === 'approval' ? '#4CAF50' : edge.type === 'rejection' ? '#f44336' : '#333',
        strokeWidth: 1.5,
      },
      animated: edge.type === 'approval',
    }));

    return { nodes, edges, swimlaneBackgrounds: backgrounds, rowCount: maxRow + 1 };
  }, [process, selectedNodeId]);

  const [nodes, setNodes, onNodesChange] = useNodesState([...swimlaneBackgrounds, ...flowNodes]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // ノードが変更されたら同期
  useMemo(() => {
    setNodes([...swimlaneBackgrounds, ...flowNodes]);
    setEdges(flowEdges);
  }, [swimlaneBackgrounds, flowNodes, flowEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        addFlowEdge({ source: params.source, target: params.target });
      }
    },
    [addFlowEdge]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.id.startsWith('swimlane-bg-')) return;
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  if (!process) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>プロセスを作成または読み込んでください</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* ヘッダー行（スイムレーン名） */}
      <div 
        className="absolute top-0 left-0 right-0 z-10 flex border-b bg-white"
        style={{ height: HEADER_HEIGHT }}
      >
        <div 
          className="flex items-center justify-center border-r bg-gray-100 font-medium text-sm"
          style={{ width: ROW_NUMBER_WIDTH }}
        >
          番号
        </div>
        {process.swimlanes.map((swimlane) => (
          <div
            key={swimlane.id}
            className="flex items-center justify-center border-r font-medium text-sm"
            style={{ 
              width: SWIMLANE_WIDTH,
              backgroundColor: swimlane.color,
            }}
          >
            {swimlane.name}
          </div>
        ))}
        <div 
          className="flex items-center justify-center border-r bg-gray-50 font-medium text-sm"
          style={{ width: DOCUMENT_COLUMN_WIDTH }}
        >
          関連規程/フォーム
        </div>
      </div>

      {/* 行番号 */}
      <div 
        className="absolute left-0 z-10 bg-gray-100 border-r"
        style={{ top: HEADER_HEIGHT, width: ROW_NUMBER_WIDTH }}
      >
        {Array.from({ length: rowCount }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-center border-b text-sm"
            style={{ height: ROW_HEIGHT }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* 関連ドキュメント列 */}
      <div 
        className="absolute right-0 z-10 bg-gray-50 border-l"
        style={{ 
          top: HEADER_HEIGHT, 
          width: DOCUMENT_COLUMN_WIDTH,
          left: ROW_NUMBER_WIDTH + process.swimlanes.length * SWIMLANE_WIDTH,
        }}
      >
        {Array.from({ length: rowCount }).map((_, i) => {
          const docs = (process.relatedDocuments || []).filter(d => d.row === i);
          return (
            <div
              key={i}
              className="flex flex-col items-center justify-center border-b p-1 text-xs"
              style={{ height: ROW_HEIGHT }}
            >
              {docs.map(doc => (
                <div 
                  key={doc.id} 
                  className="bg-white border rounded px-2 py-1 mb-1 text-center shadow-sm"
                >
                  {doc.name}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* フローチャート本体 */}
      <div 
        className="absolute"
        style={{ 
          top: HEADER_HEIGHT,
          left: ROW_NUMBER_WIDTH,
          right: DOCUMENT_COLUMN_WIDTH,
          bottom: 0,
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[10, 10]}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.5}
          maxZoom={2}
        >
          <Background gap={ROW_HEIGHT} size={1} />
          <Controls />
          <MiniMap />
          <Panel position="top-right" className="flex gap-2">
            {onExportMarkdown && (
              <Button size="sm" variant="outline" onClick={onExportMarkdown}>
                <FileText className="h-4 w-4 mr-1" />
                MD出力
              </Button>
            )}
            {onExportSvg && (
              <Button size="sm" variant="outline" onClick={onExportSvg}>
                <Download className="h-4 w-4 mr-1" />
                SVG出力
              </Button>
            )}
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
