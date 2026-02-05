import type { BusinessProcess, NodeType, Swimlane, FlowNode, FlowEdge, RelatedSystem, Report } from '@/types/flowchart';
import { v4 as uuidv4 } from 'uuid';

const SWIMLANE_COLORS = [
  '#E8F5E9', '#E3F2FD', '#FFF3E0', '#F3E5F5', 
  '#E0F7FA', '#FBE9E7', '#F1F8E9', '#E8EAF6'
];

interface ProcessNode {
  id: string;
  dept: string;
  label: string;
  row?: number;
  next?: string;
  yes?: string;
  no?: string;
}

/**
 * 新フォーマットのマークダウンをパース
 * # BusinessProcessName
 * 業務名
 * 
 * ## Description
 * ...
 * 
 * ## Dept
 * - 部門-役割
 * 
 * ## Process
 * #P1 部門-役割 内容
 * - Next: P2
 * 
 * #P2 部門-役割 判断内容
 * - Yes: P3
 * - No: P4
 * 
 * ## Reports
 * #R1 帳票名 - P: P2
 * 
 * ## Systems
 * #S1 システム名 - P: P5
 */
export function parseProcessMarkdown(markdown: string): BusinessProcess {
  const lines = markdown.split('\n').map(line => line.trim());
  
  let title = '新規業務プロセス';
  let description = '';
  const deptList: string[] = [];
  const processNodes: Map<string, ProcessNode> = new Map();
  const reportList: Array<{ id: string; name: string; rows: string[] }> = [];
  const systemList: Array<{ id: string; name: string; rows: string[] }> = [];
  
  let currentSection = '';
  let currentProcessId = '';
  
  for (const line of lines) {
    if (!line) continue;
    
    // タイトル: # BusinessProcessName の次の行
    if (line.startsWith('# BusinessProcessName')) {
      currentSection = 'title';
      continue;
    }
    
    if (currentSection === 'title' && !line.startsWith('#')) {
      title = line;
      currentSection = '';
      continue;
    }
    
    // セクションヘッダー
    if (line.startsWith('## ')) {
      const sectionName = line.substring(3).trim();
      if (sectionName === 'Description') {
        currentSection = 'description';
      } else if (sectionName === 'Dept') {
        currentSection = 'dept';
      } else if (sectionName === 'Process') {
        currentSection = 'process';
      } else if (sectionName === 'Reports') {
        currentSection = 'reports';
      } else if (sectionName === 'Systems') {
        currentSection = 'systems';
      }
      continue;
    }
    
    // 各セクションの処理
    switch (currentSection) {
      case 'description':
        if (!line.startsWith('#')) {
          description += (description ? ' ' : '') + line;
        }
        break;
        
      case 'dept':
        if (!line.startsWith('#')) {
          deptList.push(line.trim());
        }
        break;
        
      case 'process':
        // #P1 #L1 部門-役割 内容
        if (line.startsWith('#P')) {
          const match = line.match(/^#(P\d+)(?:\s+#L(\d+))?\s+(\S+)\s+(.+)$/);
          if (match) {
            currentProcessId = match[1];
            const rowNum = match[2] ? parseInt(match[2]) - 1 : undefined; // 1-indexedを1引いて0-indexedに
            const dept = match[3].trim();
            const label = match[4].trim();
            processNodes.set(currentProcessId, { id: currentProcessId, dept, label, row: rowNum });
          }
        }
        // Next: P2
        else if (line.startsWith('Next:') && currentProcessId) {
          const nextId = line.replace('Next:', '').trim();
          const node = processNodes.get(currentProcessId);
          if (node) {
            node.next = nextId;
          }
        }
        // Yes: P3
        else if (line.startsWith('Yes:') && currentProcessId) {
          const yesId = line.replace('Yes:', '').trim();
          const node = processNodes.get(currentProcessId);
          if (node) {
            node.yes = yesId;
          }
        }
        // No: P4
        else if (line.startsWith('No:') && currentProcessId) {
          const noId = line.replace('No:', '').trim();
          const node = processNodes.get(currentProcessId);
          if (node) {
            node.no = noId;
          }
        }
        break;
        
      case 'reports':
        // 購買申請書 #L: 2
        if (!line.startsWith('#') && line.includes('#L:')) {
          const match = line.match(/^(.+?)\s+#L:\s+(.+)$/);
          if (match) {
            const reportName = match[1].trim();
            const rows = match[2].split(',').map(r => r.trim());
            reportList.push({ id: `R${reportList.length + 1}`, name: reportName, rows });
          }
        }
        break;
        
      case 'systems':
        // 購買管理システム #L: 2, 9, 10
        if (!line.startsWith('#') && line.includes('#L:')) {
          const match = line.match(/^(.+?)\s+#L:\s+(.+)$/);
          if (match) {
            const systemName = match[1].trim();
            const rows = match[2].split(',').map(r => r.trim());
            systemList.push({ id: `S${systemList.length + 1}`, name: systemName, rows });
          }
        }
        break;
    }
  }
  
  // Swimlaneを構築
  const swimlanes: Swimlane[] = deptList.map((name, index) => ({
    id: uuidv4(),
    name,
    color: SWIMLANE_COLORS[index % SWIMLANE_COLORS.length],
  }));
  
  // ノードを構築
  const nodes: FlowNode[] = [];
  const nodeIdMap: Map<string, string> = new Map();
  
  Array.from(processNodes.values()).forEach((pNode, index) => {
    const swimlane = swimlanes.find(s => s.name === pNode.dept) || swimlanes[0];
    const nodeId = uuidv4();
    nodeIdMap.set(pNode.id, nodeId);
    
    // タイプの判定
    let type: NodeType = 'process';
    if (pNode.row === 0) {
      // 行番号が1 (#L1) の場合は開始ノード（内部的には0-indexed）
      type = 'start';
    } else if (!pNode.next && !pNode.yes && !pNode.no) {
      // Nextがないノードが完了ノード
      type = 'end';
    } else if (pNode.yes || pNode.no) {
      type = 'decision';
    }
    
    nodes.push({
      id: nodeId,
      type,
      label: pNode.label,
      swimlaneId: swimlane?.id || '',
      row: pNode.row !== undefined ? pNode.row : index,
    });
  });
  
  // エッジを構築
  const edges: FlowEdge[] = [];
  Array.from(processNodes.entries()).forEach(([processId, pNode]) => {
    const sourceId = nodeIdMap.get(processId);
    if (!sourceId) return;
    
    if (pNode.next) {
      const targetId = nodeIdMap.get(pNode.next);
      if (targetId) {
        edges.push({
          id: uuidv4(),
          source: sourceId,
          target: targetId,
        });
      }
    }
    
    if (pNode.yes) {
      const targetId = nodeIdMap.get(pNode.yes);
      if (targetId) {
        edges.push({
          id: uuidv4(),
          source: sourceId,
          target: targetId,
          label: 'YES',
        });
      }
    }
    
    if (pNode.no) {
      const targetId = nodeIdMap.get(pNode.no);
      if (targetId) {
        edges.push({
          id: uuidv4(),
          source: sourceId,
          target: targetId,
          label: 'NO',
        });
      }
    }
  });
  
  // Reports/Systemsを構築
  const reports: Report[] = reportList.map(r => ({
    id: uuidv4(),
    name: r.name,
    relatedNodeIds: r.rows
      .map(row => {
        const rowNum = parseInt(row) - 1; // 1-indexedを0-indexedに
        const node = Array.from(processNodes.values()).find(n => n.row === rowNum);
        return node ? nodeIdMap.get(node.id) : null;
      })
      .filter((id): id is string => !!id),
  }));
  
  const systems: RelatedSystem[] = systemList.map(s => ({
    id: uuidv4(),
    name: s.name,
    relatedNodeIds: s.rows
      .map(row => {
        const rowNum = parseInt(row) - 1; // 1-indexedを0-indexedに
        const node = Array.from(processNodes.values()).find(n => n.row === rowNum);
        return node ? nodeIdMap.get(node.id) : null;
      })
      .filter((id): id is string => !!id),
  }));
  
  return {
    id: uuidv4(),
    title,
    description,
    swimlanes,
    nodes,
    edges,
    relatedDocuments: [],
    relatedSystems: systems,
    reports,
  };
}

/**
 * BusinessProcessを新フォーマットのマークダウンにエクスポート
 */
export function exportProcessToMarkdown(process: BusinessProcess): string {
  const lines: string[] = [];
  
  // タイトル
  lines.push('# BusinessProcessName');
  lines.push(process.title);
  lines.push('');
  
  // Description
  lines.push('## Description');
  lines.push(process.description || '');
  lines.push('');
  
  // Dept
  lines.push('## Dept');
  process.swimlanes.forEach(sw => {
    lines.push(sw.name);
  });
  lines.push('');
  
  // Process
  lines.push('## Process');
  
  // ノードをrow順にソート
  const sortedNodes = [...process.nodes].sort((a, b) => (a.row || 0) - (b.row || 0));
  
  sortedNodes.forEach((node, index) => {
    const processId = `P${index + 1}`;
    const swimlane = process.swimlanes.find(sw => sw.id === node.swimlaneId);
    const deptName = swimlane?.name || '未割当';
    
    lines.push(`#${processId} #L${node.row + 1} ${deptName} ${node.label}`);
    
    // Next/Yes/No の判定
    const outgoingEdges = process.edges.filter(e => e.source === node.id);
    
    if (node.type === 'decision') {
      // 判断ノード
      const yesEdge = outgoingEdges.find(e => e.label === 'YES');
      const noEdge = outgoingEdges.find(e => e.label === 'NO');
      
      if (yesEdge) {
        const targetIndex = sortedNodes.findIndex(n => n.id === yesEdge.target);
        if (targetIndex >= 0) {
          lines.push(`Yes: P${targetIndex + 1}`);
        }
      }
      
      if (noEdge) {
        const targetIndex = sortedNodes.findIndex(n => n.id === noEdge.target);
        if (targetIndex >= 0) {
          lines.push(`No: P${targetIndex + 1}`);
        }
      }
    } else if (outgoingEdges.length > 0) {
      // 通常ノード（Next）
      const nextEdge = outgoingEdges[0];
      const targetIndex = sortedNodes.findIndex(n => n.id === nextEdge.target);
      if (targetIndex >= 0) {
        lines.push(`Next: P${targetIndex + 1}`);
      }
    }
    
    lines.push('');
  });
  
  // Reports
  if (process.reports && process.reports.length > 0) {
    lines.push('## Reports');
    process.reports.forEach((report) => {
      const rows = (report.relatedNodeIds || [])
        .map((nodeId: string) => {
          const node = sortedNodes.find(n => n.id === nodeId);
          return node ? (node.row + 1).toString() : null;
        })
        .filter((row: string | null) => row)
        .join(', ');
      
      lines.push(`${report.name} #L: ${rows || 'なし'}`);
    });
    lines.push('');
  }
  
  // Systems
  if (process.relatedSystems && process.relatedSystems.length > 0) {
    lines.push('## Systems');
    process.relatedSystems.forEach((system) => {
      const rows = (system.relatedNodeIds || [])
        .map((nodeId: string) => {
          const node = sortedNodes.find(n => n.id === nodeId);
          return node ? (node.row + 1).toString() : null;
        })
        .filter((row: string | null) => row)
        .join(', ');
      
      lines.push(`${system.name} #L: ${rows || 'なし'}`);
    });
    lines.push('');
  }
  
  return lines.join('\n');
}

// サンプルデータ
export const SAMPLE_MARKDOWN = `# BusinessProcessName
購買申請承認プロセス

## Description
従業員が物品やサービスを購入する際の申請から承認、発注、検収までの一連の業務フロー

## Dept
申請者
総務部
購買担当
経理部
承認者

## Process
#P1 #L1 申請者 開始
Next: P2

#P2 #L2 申請者 購買申請書作成
Next: P3

#P3 #L3 総務部 申請内容確認
Yes: P4
No: P2

#P4 #L4 経理部 予算確認
Yes: P5
No: P6

#P5 #L5 承認者 一次承認
Next: P7

#P6 #L5 申請者 申請内容修正
Next: P3

#P7 #L6 経理部 金額判定
Yes: P8
No: P9

#P8 #L7 承認者 最終承認
Next: P9

#P9 #L8 購買担当 発注処理
Next: P10

#P10 #L9 購買担当 納品確認
Next: P11

#P11 #L10 経理部 検収完了
Next: P12

#P12 #L11 経理部 完了

## Reports
購買申請書 #L: 2
予算確認書 #L: 4
承認記録 #L: 5, 7
発注書 #L: 8
検収書 #L: 10
納品書 #L: 9

## Systems
購買管理システム #L: 2, 8, 9, 10
予算管理システム #L: 4
承認ワークフロー #L: 5, 7
`;
