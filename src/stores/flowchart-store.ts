import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { BusinessProcess, FlowNode, FlowEdge, Swimlane, RelatedDocument, RelatedSystem, Report } from '@/types/flowchart';

interface FlowchartState {
  process: BusinessProcess | null;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedSystemId: string | null;
  selectedReportId: string | null;
  editingNodeId: string | null;
  
  // Actions
  setProcess: (process: BusinessProcess | null) => void;
  createNewProcess: (title: string) => void;
  updateProcessTitle: (title: string) => void;
  updateProcessDescription: (description: string) => void;
  
  // Swimlane actions
  addSwimlane: (name: string) => void;
  updateSwimlane: (id: string, updates: Partial<Swimlane>) => void;
  removeSwimlane: (id: string) => void;
  moveSwimlane: (id: string, direction: 'up' | 'down') => void;
  reorderSwimlanes: (swimlanes: Swimlane[]) => void;
  
  // Node actions
  addNode: (node: Omit<FlowNode, 'id'>) => string;
  updateNode: (id: string, updates: Partial<FlowNode>) => void;
  removeNode: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  setEditingNodeId: (id: string | null) => void;
  
  // Edge actions
  addEdge: (edge: Omit<FlowEdge, 'id'>) => string;
  updateEdge: (id: string, updates: Partial<FlowEdge>) => void;
  removeEdge: (id: string) => void;
  setSelectedEdge: (id: string | null) => void;
  
  // Document actions
  addDocument: (doc: Omit<RelatedDocument, 'id'>) => void;
  removeDocument: (id: string) => void;
  
  // System actions
  addSystem: (system: Omit<RelatedSystem, 'id'>) => void;
  updateSystem: (id: string, updates: Partial<RelatedSystem>) => void;
  removeSystem: (id: string) => void;
  setSelectedSystem: (id: string | null) => void;
  
  // Report actions
  addReport: (report: Omit<Report, 'id'>) => void;
  updateReport: (id: string, updates: Partial<Report>) => void;
  removeReport: (id: string) => void;
  setSelectedReport: (id: string | null) => void;
}

const COLORS = [
  '#E8F5E9', '#E3F2FD', '#FFF3E0', '#F3E5F5', 
  '#E0F7FA', '#FBE9E7', '#F1F8E9', '#E8EAF6'
];

export const useFlowchartStore = create<FlowchartState>((set, get) => ({
  process: null,
  selectedNodeId: null,
  selectedEdgeId: null,
  selectedSystemId: null,
  selectedReportId: null,
  editingNodeId: null,
  
  setProcess: (process) => set({ process }),
  
  createNewProcess: (title) => {
    const newProcess: BusinessProcess = {
      id: uuidv4(),
      title,
      swimlanes: [],
      nodes: [],
      edges: [],
      relatedDocuments: [],
      relatedSystems: [],
      reports: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ process: newProcess });
  },
  
  updateProcessTitle: (title) => {
    const { process } = get();
    if (process) {
      set({ 
        process: { 
          ...process, 
          title,
          updatedAt: new Date().toISOString()
        } 
      });
    }
  },
  
  updateProcessDescription: (description) => {
    const { process } = get();
    if (process) {
      set({ 
        process: { 
          ...process, 
          description,
          updatedAt: new Date().toISOString()
        } 
      });
    }
  },
  
  addSwimlane: (name) => {
    const { process } = get();
    if (process) {
      const colorIndex = process.swimlanes.length % COLORS.length;
      const newSwimlane: Swimlane = {
        id: uuidv4(),
        name,
        color: COLORS[colorIndex],
      };
      set({
        process: {
          ...process,
          swimlanes: [...process.swimlanes, newSwimlane],
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  
  updateSwimlane: (id, updates) => {
    const { process } = get();
    if (process) {
      set({
        process: {
          ...process,
          swimlanes: process.swimlanes.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  
  removeSwimlane: (id) => {
    const { process } = get();
    if (process) {
      set({
        process: {
          ...process,
          swimlanes: process.swimlanes.filter((s) => s.id !== id),
          nodes: process.nodes.filter((n) => n.swimlaneId !== id),
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  
  moveSwimlane: (id, direction) => {
    const { process } = get();
    if (process) {
      const index = process.swimlanes.findIndex(s => s.id === id);
      if (index === -1) return;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= process.swimlanes.length) return;
      
      const newSwimlanes = [...process.swimlanes];
      [newSwimlanes[index], newSwimlanes[newIndex]] = [newSwimlanes[newIndex], newSwimlanes[index]];
      
      set({
        process: {
          ...process,
          swimlanes: newSwimlanes,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  
  reorderSwimlanes: (swimlanes) => {
    const { process } = get();
    if (process) {
      set({
        process: {
          ...process,
          swimlanes,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  
  addNode: (node) => {
    const { process } = get();
    const id = uuidv4();
    if (process) {
      const newNode: FlowNode = { ...node, id };
      set({
        process: {
          ...process,
          nodes: [...process.nodes, newNode],
          updatedAt: new Date().toISOString(),
        },
      });
    }
    return id;
  },
  
  updateNode: (id, updates) => {
    const { process } = get();
    if (process) {
      set({
        process: {
          ...process,
          nodes: process.nodes.map((n) =>
            n.id === id ? { ...n, ...updates } : n
          ),
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  
  removeNode: (id) => {
    const { process } = get();
    if (process) {
      set({
        process: {
          ...process,
          nodes: process.nodes.filter((n) => n.id !== id),
          edges: process.edges.filter((e) => e.source !== id && e.target !== id),
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  
  setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  
  setEditingNodeId: (id) => set({ editingNodeId: id }),
  
  addEdge: (edge) => {
    const { process } = get();
    const id = uuidv4();
    if (process) {
      const newEdge: FlowEdge = { ...edge, id };
      set({
        process: {
          ...process,
          edges: [...process.edges, newEdge],
          updatedAt: new Date().toISOString(),
        },
      });
    }
    return id;
  },
  
  updateEdge: (id, updates) => {
    const { process } = get();
    if (process) {
      set({
        process: {
          ...process,
          edges: process.edges.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  
  removeEdge: (id) => {
    const { process } = get();
    if (process) {
      set({
        process: {
          ...process,
          edges: process.edges.filter((e) => e.id !== id),
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  
  setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
  
  addDocument: (doc) => {
    const { process } = get();
    if (process) {
      const newDoc: RelatedDocument = { ...doc, id: uuidv4() };
      set({
        process: {
          ...process,
          relatedDocuments: [...(process.relatedDocuments || []), newDoc],
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  
  removeDocument: (id) => {
    const { process } = get();
    if (process) {
      set({
        process: {
          ...process,
          relatedDocuments: (process.relatedDocuments || []).filter((d) => d.id !== id),
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  
  addSystem: (system) => {
    const { process } = get();
    if (process) {
      const newSystem: RelatedSystem = { ...system, id: uuidv4() };
      set({
        process: {
          ...process,
          relatedSystems: [...(process.relatedSystems || []), newSystem],
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  
  updateSystem: (id, updates) => {
    const { process } = get();
    if (process) {
      set({
        process: {
          ...process,
          relatedSystems: (process.relatedSystems || []).map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  
  removeSystem: (id) => {
    const { process } = get();
    if (process) {
      set({
        process: {
          ...process,
          relatedSystems: (process.relatedSystems || []).filter((s) => s.id !== id),
          updatedAt: new Date().toISOString(),
        },
        selectedSystemId: null,
      });
    }
  },
  
  setSelectedSystem: (id) => set({ selectedSystemId: id, selectedNodeId: null, selectedEdgeId: null, selectedReportId: null }),
  
  addReport: (report) => {
    const { process } = get();
    if (process) {
      const newReport: Report = { ...report, id: uuidv4() };
      set({
        process: {
          ...process,
          reports: [...(process.reports || []), newReport],
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  
  updateReport: (id, updates) => {
    const { process } = get();
    if (process) {
      set({
        process: {
          ...process,
          reports: (process.reports || []).map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  
  removeReport: (id) => {
    const { process } = get();
    if (process) {
      set({
        process: {
          ...process,
          reports: (process.reports || []).filter((r) => r.id !== id),
          updatedAt: new Date().toISOString(),
        },
        selectedReportId: null,
      });
    }
  },
  
  setSelectedReport: (id) => set({ selectedReportId: id, selectedNodeId: null, selectedEdgeId: null, selectedSystemId: null }),
}));
