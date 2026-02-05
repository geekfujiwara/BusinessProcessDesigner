import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface StartEndNodeData {
  label: string;
  nodeType: 'start' | 'end';
  isSelected?: boolean;
}

export const StartEndNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as StartEndNodeData;
  const isStart = nodeData.nodeType === 'start';
  const bgColor = isStart ? '#81C784' : '#EF9A9A';
  const borderColor = isStart ? '#388E3C' : '#D32F2F';
  
  return (
    <div
      className={`
        px-4 py-2 rounded-full shadow-md border-2 min-w-[80px] text-center
        ${selected || nodeData.isSelected ? 'ring-2 ring-blue-200' : ''}
      `}
      style={{
        backgroundColor: bgColor,
        borderColor: selected || nodeData.isSelected ? '#3B82F6' : borderColor,
      }}
    >
      {!isStart && <Handle type="target" position={Position.Top} className="w-2 h-2" />}
      <div className="text-sm font-medium text-gray-800">{nodeData.label}</div>
      {isStart && <Handle type="source" position={Position.Bottom} className="w-2 h-2" />}
    </div>
  );
});

StartEndNode.displayName = 'StartEndNode';
