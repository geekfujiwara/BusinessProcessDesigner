import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useFlowchartStore } from '@/stores/flowchart-store';
import { Button } from '@/components/ui/button';
import { Download, FileText, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

// 定数
const SWIMLANE_WIDTH = 130;
const ROW_HEIGHT = 90;
const HEADER_HEIGHT = 40;
const ROW_NUMBER_WIDTH = 40;
const SYSTEM_COLUMN_WIDTH = 130;
const REPORT_COLUMN_WIDTH = 130;
const NODE_WIDTH = 110;
const NODE_HEIGHT = 60;

interface SwimlaneDiagramProps {
  onExportMarkdown?: () => void;
  onExportSvg?: () => void;
}

export function SwimlaneDiagram({ onExportMarkdown, onExportSvg }: SwimlaneDiagramProps) {
  const { process, setSelectedNode, selectedNodeId, setEditingNodeId } = useFlowchartStore();
  const [zoom, setZoom] = useState(1);
  const [isManualZoom, setIsManualZoom] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const handleZoomIn = useCallback(() => {
    setIsManualZoom(true);
    setZoom(z => Math.min(z + 0.1, 2));
  }, []);
  const handleZoomOut = useCallback(() => {
    setIsManualZoom(true);
    setZoom(z => Math.max(z - 0.1, 0.5));
  }, []);
  
  const handleExportSvg = useCallback(() => {
    if (svgRef.current && process) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${process.title.replace(/\s+/g, '_')}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
    onExportSvg?.();
  }, [process, onExportSvg]);

  const diagram = useMemo(() => {
    if (!process) return null;
    
    // システムとレポートの関連ノードから行番号を取得
    const systemRows = (process.relatedSystems || []).flatMap(s => 
      (s.relatedNodeIds || []).map(nodeId => {
        const node = process.nodes.find(n => n.id === nodeId);
        return node ? node.row + 1 : 0;
      })
    );
    
    const reportRows = (process.reports || []).flatMap(r => 
      (r.relatedNodeIds || []).map(nodeId => {
        const node = process.nodes.find(n => n.id === nodeId);
        return node ? node.row + 1 : 0;
      })
    );
    
    const rowCount = Math.max(
      ...process.nodes.map(n => n.row + 1),
      ...systemRows,
      ...reportRows,
      10
    );

    const totalWidth = ROW_NUMBER_WIDTH + process.swimlanes.length * SWIMLANE_WIDTH + SYSTEM_COLUMN_WIDTH + REPORT_COLUMN_WIDTH;
    const totalHeight = HEADER_HEIGHT + rowCount * ROW_HEIGHT;

    const nodePositions = new Map<string, { x: number; y: number }>();
    process.nodes.forEach(node => {
      const swimlaneIndex = process.swimlanes.findIndex(s => s.id === node.swimlaneId);
      if (swimlaneIndex >= 0) {
        const x = ROW_NUMBER_WIDTH + swimlaneIndex * SWIMLANE_WIDTH + SWIMLANE_WIDTH / 2;
        const y = HEADER_HEIGHT + node.row * ROW_HEIGHT + ROW_HEIGHT / 2;
        nodePositions.set(node.id, { x, y });
      }
    });

    return { rowCount, totalWidth, totalHeight, nodePositions };
  }, [process]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('ResizeObserver' in window)) {
      return;
    }
    const element = viewportRef.current;
    if (!element) return;
    setViewportWidth(element.clientWidth);
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setViewportWidth(entry.contentRect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const fitDiagramToViewport = useCallback(() => {
    if (!diagram || !viewportWidth) return;
    if (!Number.isFinite(diagram.totalWidth) || diagram.totalWidth === 0) {
      setZoom(1);
      return;
    }
    const fitValue = Math.min(1, viewportWidth / diagram.totalWidth);
    const clamped = Math.max(0.4, fitValue);
    setZoom(clamped);
  }, [diagram, viewportWidth]);

  useEffect(() => {
    if (!isManualZoom) {
      fitDiagramToViewport();
    }
  }, [fitDiagramToViewport, isManualZoom]);

  useEffect(() => {
    setIsManualZoom(false);
  }, [process?.id]);

  const handleFitToWidth = useCallback(() => {
    setIsManualZoom(false);
    fitDiagramToViewport();
  }, [fitDiagramToViewport]);
  
  if (!process || !diagram) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>プロセスを作成または読み込んでください</p>
      </div>
    );
  }
  
  const { rowCount, totalWidth, totalHeight, nodePositions } = diagram;
  
  // テキストを複数行に分割するヘルパー関数
  const wrapText = (text: string, maxCharsPerLine: number): string[] => {
    const lines: string[] = [];
    let remaining = text;
    while (remaining.length > 0) {
      if (remaining.length <= maxCharsPerLine) {
        lines.push(remaining);
        break;
      }
      lines.push(remaining.slice(0, maxCharsPerLine));
      remaining = remaining.slice(maxCharsPerLine);
    }
    return lines;
  };
  
  // ノード形状の描画
  const renderNode = (node: typeof process.nodes[0], pos: { x: number; y: number }) => {
    const isSelected = selectedNodeId === node.id;
    const halfWidth = NODE_WIDTH / 2;
    const halfHeight = NODE_HEIGHT / 2;
    
    switch (node.type) {
      case 'decision': {
        const lines = wrapText(node.label, 6);
        const lineHeight = 12;
        const startY = pos.y - ((lines.length - 1) * lineHeight) / 2;
        return (
          <g 
            key={node.id} 
            onClick={() => {
              setSelectedNode(node.id);
              setEditingNodeId(node.id);
            }}
            className="cursor-pointer"
          >
            <polygon
              points={`${pos.x},${pos.y - halfHeight} ${pos.x + halfWidth},${pos.y} ${pos.x},${pos.y + halfHeight} ${pos.x - halfWidth},${pos.y}`}
              fill="white"
              stroke={isSelected ? '#3B82F6' : '#333'}
              strokeWidth={isSelected ? 2 : 1}
            />
            {lines.map((line, i) => (
              <text
                key={i}
                x={pos.x}
                y={startY + i * lineHeight}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="#333"
              >
                {line}
              </text>
            ))}
          </g>
        );
      }
        
      case 'start':
      case 'end': {
        const bgColor = node.type === 'start' ? '#81C784' : '#EF9A9A';
        return (
          <g 
            key={node.id}
            onClick={() => {
              setSelectedNode(node.id);
              setEditingNodeId(node.id);
            }}
            className="cursor-pointer"
          >
            <ellipse
              cx={pos.x}
              cy={pos.y}
              rx={halfWidth * 0.8}
              ry={halfHeight * 0.6}
              fill={bgColor}
              stroke={isSelected ? '#3B82F6' : '#333'}
              strokeWidth={isSelected ? 2 : 1}
            />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="#333"
            >
              {node.label}
            </text>
          </g>
        );
      }
        
      case 'document': {
        const lines = wrapText(node.label, 10);
        const lineHeight = 12;
        const startY = pos.y - 5 - ((lines.length - 1) * lineHeight) / 2;
        return (
          <g 
            key={node.id}
            onClick={() => {
              setSelectedNode(node.id);
              setEditingNodeId(node.id);
            }}
            className="cursor-pointer"
          >
            <path
              d={`M ${pos.x - halfWidth} ${pos.y - halfHeight}
                  L ${pos.x + halfWidth} ${pos.y - halfHeight}
                  L ${pos.x + halfWidth} ${pos.y + halfHeight * 0.6}
                  Q ${pos.x} ${pos.y + halfHeight * 0.3} ${pos.x - halfWidth} ${pos.y + halfHeight * 0.6}
                  Z`}
              fill="#90CAF9"
              stroke={isSelected ? '#3B82F6' : '#1976D2'}
              strokeWidth={isSelected ? 2 : 1}
            />
            {lines.map((line, i) => (
              <text
                key={i}
                x={pos.x}
                y={startY + i * lineHeight}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="#333"
              >
                {line}
              </text>
            ))}
          </g>
        );
      }
        
      default: {
        // process, subprocess
        const lines = wrapText(node.label, 10);
        const lineHeight = 12;
        const startY = pos.y - ((lines.length - 1) * lineHeight) / 2;
        return (
          <g 
            key={node.id}
            onClick={() => {
              setSelectedNode(node.id);
              setEditingNodeId(node.id);
            }}
            className="cursor-pointer"
          >
            <rect
              x={pos.x - halfWidth}
              y={pos.y - halfHeight}
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              rx={4}
              fill="#4DB6AC"
              stroke={isSelected ? '#3B82F6' : '#00897B'}
              strokeWidth={isSelected ? 2 : 1}
            />
            {lines.map((line, i) => (
              <text
                key={i}
                x={pos.x}
                y={startY + i * lineHeight}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="white"
              >
                {line}
              </text>
            ))}
          </g>
        );
      }
    }
  };
  
  // エッジの描画
  const renderEdges = () => {
    return process.edges.map(edge => {
      const sourcePos = nodePositions.get(edge.source);
      const targetPos = nodePositions.get(edge.target);
      if (!sourcePos || !targetPos) return null;
      
      const sourceNode = process.nodes.find(n => n.id === edge.source);
      const targetNode = process.nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return null;
      
      // ソースの出力点
      let startX = sourcePos.x;
      let startY = sourcePos.y + NODE_HEIGHT / 2;
      
      // ターゲットの入力点
      let endX = targetPos.x;
      let endY = targetPos.y - NODE_HEIGHT / 2;
      
      // 後ろに戻る矢印かどうかを判定
      const isBackward = sourceNode.row > targetNode.row;
      
      // 同じ行の場合は横方向に接続
      if (sourceNode.row === targetNode.row) {
        if (sourcePos.x < targetPos.x) {
          startX = sourcePos.x + NODE_WIDTH / 2;
          startY = sourcePos.y;
          endX = targetPos.x - NODE_WIDTH / 2;
          endY = targetPos.y;
        } else {
          startX = sourcePos.x - NODE_WIDTH / 2;
          startY = sourcePos.y;
          endX = targetPos.x + NODE_WIDTH / 2;
          endY = targetPos.y;
        }
      }
      
      // パスを作成（後ろに戻る場合は少し外側に迂回）
      let path: string;
      if (isBackward) {
        // 後ろに戻る場合は右側に迂回
        const offsetX = 40;
        path = `M ${startX} ${startY} 
                L ${startX} ${startY + 20} 
                L ${startX + offsetX} ${startY + 20}
                L ${startX + offsetX} ${endY - 20}
                L ${endX} ${endY - 20}
                L ${endX} ${endY}`;
      } else if (sourceNode.row === targetNode.row) {
        path = `M ${startX} ${startY} L ${endX} ${endY}`;
      } else {
        const midY = (startY + endY) / 2;
        path = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
      }
      
      const strokeColor = edge.type === 'approval' ? '#4CAF50' : edge.type === 'rejection' ? '#f44336' : isBackward ? '#FF9800' : '#666';
      
      return (
        <g key={edge.id}>
          <path
            d={path}
            fill="none"
            stroke={strokeColor}
            strokeWidth={isBackward ? 2 : 1.5}
            strokeDasharray={isBackward ? "5,3" : "none"}
            markerEnd="url(#arrowhead)"
          />
          {edge.label && (
            <text
              x={(startX + endX) / 2}
              y={(startY + endY) / 2 - 5}
              textAnchor="middle"
              fontSize="9"
              fill="#666"
            >
              {edge.label}
            </text>
          )}
        </g>
      );
    });
  };
  
  return (
    <div className="h-full w-full flex flex-col min-h-0 min-w-0 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      {/* ツールバー - 固定 */}
      <div className="flex items-center justify-between px-4 py-2 border-b shrink-0" style={{ backgroundColor: '#ffffff' }}>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm" style={{ color: '#374151' }}>{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleFitToWidth}>
            <Maximize2 className="h-4 w-4 mr-1" />
            フィット
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {onExportMarkdown && (
            <Button variant="outline" size="sm" onClick={onExportMarkdown}>
              <FileText className="h-4 w-4 mr-1" />
              MD出力
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExportSvg}>
            <Download className="h-4 w-4 mr-1" />
            SVG出力
          </Button>
        </div>
      </div>
      
      {/* タイトル - 固定 */}
      <div className="text-center py-3 border-b shrink-0" style={{ backgroundColor: '#ffffff' }}>
        <h2 className="text-lg font-bold border-b-2 border-blue-500 inline-block px-8 py-2" style={{ color: '#1f2937' }}>
          {process.title}
        </h2>
      </div>
      
      {/* ダイアグラム - スクロール可能 */}
      <div ref={viewportRef} className="flex-1 overflow-auto min-h-0 min-w-0" style={{ backgroundColor: '#f9fafb' }}>
        <div className="p-4">
          <svg
            ref={svgRef}
            width={totalWidth * zoom}
            height={totalHeight * zoom}
            viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            style={{ border: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}
          >
            {/* 矢印マーカー定義 */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
              </marker>
            </defs>
            
            {/* ヘッダー背景 */}
            <rect x={0} y={0} width={totalWidth} height={HEADER_HEIGHT} fill="#f5f5f5" stroke="#ddd" />
            
            {/* 行番号ヘッダー */}
            <rect x={0} y={0} width={ROW_NUMBER_WIDTH} height={HEADER_HEIGHT} fill="#e0e0e0" stroke="#ccc" />
            <text x={ROW_NUMBER_WIDTH / 2} y={HEADER_HEIGHT / 2} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="bold">
              番号
            </text>
            
            {/* スイムレーンヘッダー */}
            {process.swimlanes.map((swimlane, index) => {
              const x = ROW_NUMBER_WIDTH + index * SWIMLANE_WIDTH;
              return (
                <g key={swimlane.id}>
                  <rect
                    x={x}
                    y={0}
                    width={SWIMLANE_WIDTH}
                    height={HEADER_HEIGHT}
                    fill={swimlane.color}
                    stroke="#ccc"
                  />
                  <text
                    x={x + SWIMLANE_WIDTH / 2}
                    y={HEADER_HEIGHT / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {swimlane.name}
                  </text>
                </g>
              );
            })}
            
            {/* ドキュメント列ヘッダー */}
            <rect
              x={ROW_NUMBER_WIDTH + process.swimlanes.length * SWIMLANE_WIDTH}
              y={0}
              width={SYSTEM_COLUMN_WIDTH}
              height={HEADER_HEIGHT}
              fill="#f0f0f0"
              stroke="#ccc"
            />
            <text
              x={ROW_NUMBER_WIDTH + process.swimlanes.length * SWIMLANE_WIDTH + SYSTEM_COLUMN_WIDTH / 2}
              y={HEADER_HEIGHT / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="bold"
            >
              関連システム
            </text>
            
            {/* 帳票列ヘッダー */}
            <rect
              x={ROW_NUMBER_WIDTH + process.swimlanes.length * SWIMLANE_WIDTH + SYSTEM_COLUMN_WIDTH}
              y={0}
              width={REPORT_COLUMN_WIDTH}
              height={HEADER_HEIGHT}
              fill="#f0f0f0"
              stroke="#ccc"
            />
            <text
              x={ROW_NUMBER_WIDTH + process.swimlanes.length * SWIMLANE_WIDTH + SYSTEM_COLUMN_WIDTH + REPORT_COLUMN_WIDTH / 2}
              y={HEADER_HEIGHT / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="bold"
            >
              帳票
            </text>
            
            {/* 行番号とグリッド */}
            {Array.from({ length: rowCount }).map((_, i) => {
              const y = HEADER_HEIGHT + i * ROW_HEIGHT;
              return (
                <g key={`row-${i}`}>
                  {/* 行番号 */}
                  <rect x={0} y={y} width={ROW_NUMBER_WIDTH} height={ROW_HEIGHT} fill="#f5f5f5" stroke="#ddd" />
                  <text x={ROW_NUMBER_WIDTH / 2} y={y + ROW_HEIGHT / 2} textAnchor="middle" dominantBaseline="middle" fontSize="11">
                    {i + 1}
                  </text>
                  
                  {/* スイムレーン背景 */}
                  {process.swimlanes.map((swimlane, sIndex) => (
                    <rect
                      key={`${swimlane.id}-${i}`}
                      x={ROW_NUMBER_WIDTH + sIndex * SWIMLANE_WIDTH}
                      y={y}
                      width={SWIMLANE_WIDTH}
                      height={ROW_HEIGHT}
                      fill={swimlane.color}
                      fillOpacity={0.3}
                      stroke="#ddd"
                    />
                  ))}
                  
                  {/* システム列 */}
                  <rect
                    x={ROW_NUMBER_WIDTH + process.swimlanes.length * SWIMLANE_WIDTH}
                    y={y}
                    width={SYSTEM_COLUMN_WIDTH}
                    height={ROW_HEIGHT}
                    fill="#fafafa"
                    stroke="#ddd"
                  />
                  
                  {/* 帳票列 */}
                  <rect
                    x={ROW_NUMBER_WIDTH + process.swimlanes.length * SWIMLANE_WIDTH + SYSTEM_COLUMN_WIDTH}
                    y={y}
                    width={REPORT_COLUMN_WIDTH}
                    height={ROW_HEIGHT}
                    fill="#fafafa"
                    stroke="#ddd"
                  />
                </g>
              );
            })}
            
            {/* エッジ */}
            {renderEdges()}
            
            {/* ノード */}
            {process.nodes.map(node => {
              const pos = nodePositions.get(node.id);
              if (!pos) return null;
              return renderNode(node, pos);
            })}
            
            {/* 関連システム */}
            {(process.relatedSystems || []).flatMap(system => {
              // relatedNodeIdsの各ノードに対してシステムを表示
              return (system.relatedNodeIds || []).map((nodeId) => {
                const relatedNode = process.nodes.find(n => n.id === nodeId);
                if (!relatedNode) return null;
                
                const nodeRow = relatedNode.row;
                const x = ROW_NUMBER_WIDTH + process.swimlanes.length * SWIMLANE_WIDTH + SYSTEM_COLUMN_WIDTH / 2;
                const y = HEADER_HEIGHT + nodeRow * ROW_HEIGHT + ROW_HEIGHT / 2;
                const lines = wrapText(system.name, 10);
                const lineHeight = 11;
                const startY = y - ((lines.length - 1) * lineHeight) / 2;
                const boxHeight = Math.max(30, lines.length * lineHeight + 10);
                
                return (
                  <g 
                    key={`${system.id}-${nodeId}`}
                    onClick={() => {
                      // 関連システムを選択して編集パネルで編集できるように
                      const systemStore = useFlowchartStore.getState();
                      systemStore.setSelectedSystem(system.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      x={x - 55}
                      y={y - boxHeight / 2}
                      width={110}
                      height={boxHeight}
                      rx={3}
                      fill="#E3F2FD"
                      stroke="#1976D2"
                    />
                    {lines.map((line, i) => (
                      <text
                        key={i}
                        x={x}
                        y={startY + i * lineHeight}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="9"
                        fill="#0D47A1"
                      >
                        {line}
                      </text>
                    ))}
                  </g>
                );
              }).filter(Boolean);
            })}
            
            {/* 帳票 */}
            {(process.reports || []).flatMap(report => {
              // relatedNodeIdsの各ノードに対して帳票を表示
              return (report.relatedNodeIds || []).map((nodeId) => {
                const relatedNode = process.nodes.find(n => n.id === nodeId);
                if (!relatedNode) return null;
                
                const nodeRow = relatedNode.row;
                const x = ROW_NUMBER_WIDTH + process.swimlanes.length * SWIMLANE_WIDTH + SYSTEM_COLUMN_WIDTH + REPORT_COLUMN_WIDTH / 2;
                const y = HEADER_HEIGHT + nodeRow * ROW_HEIGHT + ROW_HEIGHT / 2;
                const lines = wrapText(report.name, 10);
                const lineHeight = 11;
                const startY = y - ((lines.length - 1) * lineHeight) / 2;
                const boxHeight = Math.max(30, lines.length * lineHeight + 10);
                
                return (
                  <g 
                    key={`${report.id}-${nodeId}`}
                  onClick={() => {
                    // 帳票を選択して編集パネルで編集できるように
                    const reportStore = useFlowchartStore.getState();
                    reportStore.setSelectedReport(report.id);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={x - 55}
                    y={y - boxHeight / 2}
                    width={110}
                    height={boxHeight}
                    rx={3}
                    fill="#FFF3E0"
                    stroke="#F57C00"
                  />
                  {lines.map((line, i) => (
                    <text
                      key={i}
                      x={x}
                      y={startY + i * lineHeight}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="9"
                      fill="#E65100"
                    >
                      {line}
                    </text>
                  ))}
                </g>
                );
              }).filter(Boolean);
            })}
            
            {/* 関連ドキュメント（後方互換性のため残す） */}
            {(process.relatedDocuments || []).map(doc => {
              const x = ROW_NUMBER_WIDTH + process.swimlanes.length * SWIMLANE_WIDTH + SYSTEM_COLUMN_WIDTH / 2;
              const y = HEADER_HEIGHT + (doc.row ?? 0) * ROW_HEIGHT + ROW_HEIGHT / 2;
              const docLines = wrapText(doc.name, 10);
              const docLineHeight = 11;
              const docStartY = y - ((docLines.length - 1) * docLineHeight) / 2;
              const boxHeight = Math.max(30, docLines.length * docLineHeight + 10);
              return (
                <g key={doc.id}>
                  <rect
                    x={x - 55}
                    y={y - boxHeight / 2}
                    width={110}
                    height={boxHeight}
                    rx={3}
                    fill="white"
                    stroke="#ccc"
                  />
                  {docLines.map((line, i) => (
                    <text
                      key={i}
                      x={x}
                      y={docStartY + i * docLineHeight}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="9"
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
