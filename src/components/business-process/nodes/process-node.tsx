import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface ProcessNodeData {
  label: string;
  description?: string;
  isSelected?: boolean;
}

export const ProcessNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as ProcessNodeData;
  
  return (
    <div
      className={`
        px-4 py-2 rounded-md shadow-md border-2 min-w-[100px] text-center
        bg-[#4DB6AC] text-white
        ${selected || nodeData.isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-[#00897B]'}
      `}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="text-sm font-medium">{nodeData.label}</div>
      {nodeData.description && (
        <div className="text-xs mt-1 opacity-80">{nodeData.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
      <Handle type="source" position={Position.Left} id="left" className="w-2 h-2" />
      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2" />
    </div>
  );
});

ProcessNode.displayName = 'ProcessNode';
