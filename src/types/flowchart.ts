// 業務プロセスフローチャートの型定義

export type NodeType = 'process' | 'decision' | 'start' | 'end' | 'document' | 'subprocess';

export interface Swimlane {
  id: string;
  name: string;
  color: string;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  label: string;
  swimlaneId: string;
  row: number;
  description?: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'default' | 'approval' | 'rejection';
}

export interface BusinessProcess {
  id?: string;
  title: string;
  description?: string;
  documentUrl?: string;
  category?: string;
  swimlanes: Swimlane[];
  nodes: FlowNode[];
  edges: FlowEdge[];
  relatedDocuments?: RelatedDocument[];
  relatedSystems?: RelatedSystem[];
  reports?: Report[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  modifiedBy?: string;
}

export interface RelatedDocument {
  id: string;
  name: string;
  relatedNodeIds?: string[];
  row?: number;
}

export interface RelatedSystem {
  id: string;
  name: string;
  relatedNodeIds?: string[];
  row?: number;
}

export interface Report {
  id: string;
  name: string;
  relatedNodeIds?: string[];
  row?: number;
}

// マークダウン構造
export interface ProcessMarkdown {
  title: string;
  description?: string;
  swimlanes: string[];
  steps: ProcessStep[];
  documents?: string[];
}

export interface ProcessStep {
  number: number;
  swimlane: string;
  type: NodeType;
  label: string;
  description?: string;
  nextSteps?: string[];
  condition?: string;
}

// デフォルトカラー
export const SWIMLANE_COLORS = [
  '#E8F5E9', // 緑系
  '#E3F2FD', // 青系
  '#FFF3E0', // オレンジ系
  '#F3E5F5', // 紫系
  '#E0F7FA', // シアン系
  '#FBE9E7', // 深いオレンジ系
  '#F1F8E9', // ライム系
  '#E8EAF6', // インディゴ系
];

export const NODE_COLORS: Record<NodeType, string> = {
  process: '#4DB6AC',
  decision: '#FFFFFF',
  start: '#81C784',
  end: '#EF9A9A',
  document: '#90CAF9',
  subprocess: '#CE93D8',
};
