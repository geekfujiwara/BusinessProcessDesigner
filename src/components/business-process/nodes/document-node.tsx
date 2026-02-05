import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface DocumentNodeData {
  label: string;
  isSelected?: boolean;
}

export const DocumentNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as DocumentNodeData;
  
  return (
    <div className="relative" style={{ width: 100, height: 60 }}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <svg width="100" height="60" viewBox="0 0 100 60">
        {/* ドキュメント形状（波形の底） */}
        <path
          d="M 5 5 L 95 5 L 95 50 Q 72 42 50 50 Q 28 58 5 50 Z"
          fill="#90CAF9"
          stroke={selected || nodeData.isSelected ? '#3B82F6' : '#1976D2'}
          strokeWidth={selected || nodeData.isSelected ? 3 : 2}
        />
        <text
          x="50"
          y="27"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fill="#333"
        >
          {nodeData.label}
        </text>
      </svg>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" style={{ bottom: 4 }} />
    </div>
  );
});

DocumentNode.displayName = 'DocumentNode';
