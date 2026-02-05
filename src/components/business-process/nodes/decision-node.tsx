import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface DecisionNodeData {
  label: string;
  isSelected?: boolean;
}

export const DecisionNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as DecisionNodeData;
  
  return (
    <div className="relative" style={{ width: 100, height: 60 }}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" style={{ top: -4 }} />
      <svg width="100" height="60" viewBox="0 0 100 60">
        <polygon
          points="50,5 95,30 50,55 5,30"
          fill="white"
          stroke={selected || nodeData.isSelected ? '#3B82F6' : '#333'}
          strokeWidth={selected || nodeData.isSelected ? 3 : 2}
        />
        <text
          x="50"
          y="30"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fill="#333"
        >
          {nodeData.label}
        </text>
      </svg>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" style={{ bottom: -4 }} />
      <Handle type="source" position={Position.Left} id="left" className="w-2 h-2" style={{ left: -4 }} />
      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2" style={{ right: -4 }} />
    </div>
  );
});

DecisionNode.displayName = 'DecisionNode';
