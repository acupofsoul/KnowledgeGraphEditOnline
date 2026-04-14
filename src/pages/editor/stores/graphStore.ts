import { create } from 'zustand';
import { Node, Edge, ExportFormat } from '../types';

interface GraphStore {
  // 状态
  nodes: Node[];
  edges: Edge[];
  isLoading: boolean;
  error: string | null;
  
  // 操作
  addNode: (node: Omit<Node, 'id' | 'createdAt' | 'updatedAt'>) => Node;
  addEdge: (edge: Omit<Edge, 'id' | 'createdAt' | 'updatedAt'>) => Edge;
  updateNode: (id: string, updates: Partial<Node>) => void;
  updateEdge: (id: string, updates: Partial<Edge>) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  deleteSelected: (nodeIds: string[], edgeIds: string[]) => void;
  moveNodes: (nodeIds: string[], deltaX: number, deltaY: number) => void;
  copyNodes: (nodeIds: string[]) => { nodes: Node[]; edges: Edge[] };
  pasteNodes: (copiedNodes: Node[], copiedEdges: Edge[], offsetX: number, offsetY: number) => void;
  clearGraph: () => void;
  
  // 导入/导出
  importGraph: (data: { nodes: Node[]; edges: Edge[] }) => void;
  exportGraph: (format: ExportFormat) => string;
  
  // 辅助方法
  getNodeById: (id: string) => Node | undefined;
  getEdgeById: (id: string) => Edge | undefined;
  getNodesByType: (type: string) => Node[];
  getEdgesByType: (type: string) => Edge[];
  getNodeCount: () => number;
  getEdgeCount: () => number;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  // 初始状态
  nodes: [],
  edges: [],
  isLoading: false,
  error: null,
  
  // 添加节点
  addNode: (node) => {
    const newNode: Node = {
      ...node,
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
    
    return newNode;
  },
  
  // 添加边
  addEdge: (edge) => {
    const newEdge: Edge = {
      ...edge,
      id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      edges: [...state.edges, newEdge],
    }));
    
    return newEdge;
  },
  
  // 更新节点
  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, ...updates, updatedAt: new Date().toISOString() }
          : node
      ),
    }));
  },
  
  // 更新边
  updateEdge: (id, updates) => {
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === id
          ? { ...edge, ...updates, updatedAt: new Date().toISOString() }
          : edge
      ),
    }));
  },
  
  // 删除节点
  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
    }));
  },
  
  // 删除边
  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
  },
  
  // 删除选中的节点和边
  deleteSelected: (nodeIds, edgeIds) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => !nodeIds.includes(node.id)),
      edges: state.edges.filter((edge) => 
        !edgeIds.includes(edge.id) && 
        !nodeIds.includes(edge.source) && 
        !nodeIds.includes(edge.target)
      ),
    }));
  },
  
  // 移动节点
  moveNodes: (nodeIds, deltaX, deltaY) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        nodeIds.includes(node.id)
          ? { ...node, x: node.x + deltaX, y: node.y + deltaY, updatedAt: new Date().toISOString() }
          : node
      ),
    }));
  },
  
  // 复制节点
  copyNodes: (nodeIds) => {
    const { nodes, edges } = get();
    const copiedNodes = nodes.filter((node) => nodeIds.includes(node.id));
    const copiedEdges = edges.filter(
      (edge) => nodeIds.includes(edge.source) && nodeIds.includes(edge.target)
    );
    
    return { nodes: copiedNodes, edges: copiedEdges };
  },
  
  // 粘贴节点
  pasteNodes: (copiedNodes, copiedEdges, offsetX, offsetY) => {
    const newNodes: Node[] = [];
    const idMap: Record<string, string> = {};
    
    // 创建新节点
    for (const node of copiedNodes) {
      const newNode = get().addNode({
        ...node,
        label: `${node.label} (副本)`,
        x: node.x + offsetX,
        y: node.y + offsetY,
      });
      newNodes.push(newNode);
      idMap[node.id] = newNode.id;
    }
    
    // 创建新边
    for (const edge of copiedEdges) {
      if (idMap[edge.source] && idMap[edge.target]) {
        get().addEdge({
          ...edge,
          source: idMap[edge.source],
          target: idMap[edge.target],
        });
      }
    }
  },
  
  // 清空图
  clearGraph: () => {
    set({ nodes: [], edges: [] });
  },
  
  // 导入图
  importGraph: (data) => {
    set({ nodes: data.nodes, edges: data.edges });
  },
  
  // 导出图
  exportGraph: (format) => {
    const { nodes, edges } = get();
    
    switch (format) {
      case 'json':
        return JSON.stringify({ nodes, edges }, null, 2);
      case 'csv':
        // 生成 CSV 格式
        const nodeCsv = 'Node ID,Label,Type,X,Y\n' + 
          nodes.map(node => `${node.id},"${node.label}",${node.type},${node.x},${node.y}`).join('\n');
        const edgeCsv = 'Edge ID,Source,Target,Label,Type\n' + 
          edges.map(edge => `${edge.id},${edge.source},${edge.target},"${edge.label}",${edge.type}`).join('\n');
        return nodeCsv + '\n\n' + edgeCsv;
      case 'json-ld':
        // 生成 JSON-LD 格式
        const jsonLd = {
          '@context': {
            rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
            xsd: 'http://www.w3.org/2001/XMLSchema#',
          },
          '@graph': [
            ...nodes.map(node => ({
              '@id': `#${node.id}`,
              '@type': node.type,
              'rdfs:label': node.label,
              ...Object.entries(node.properties).map(([key, value]) => ({ [key]: value }))
            })),
            ...edges.map(edge => ({
              '@id': `#${edge.id}`,
              '@type': edge.type,
              'rdf:subject': `#${edge.source}`,
              'rdf:predicate': edge.label,
              'rdf:object': `#${edge.target}`,
              ...Object.entries(edge.properties).map(([key, value]) => ({ [key]: value }))
            }))
          ]
        };
        return JSON.stringify(jsonLd, null, 2);
      default:
        return JSON.stringify({ nodes, edges }, null, 2);
    }
  },
  
  // 根据 ID 获取节点
  getNodeById: (id) => {
    return get().nodes.find((node) => node.id === id);
  },
  
  // 根据 ID 获取边
  getEdgeById: (id) => {
    return get().edges.find((edge) => edge.id === id);
  },
  
  // 根据类型获取节点
  getNodesByType: (type) => {
    return get().nodes.filter((node) => node.type === type);
  },
  
  // 根据类型获取边
  getEdgesByType: (type) => {
    return get().edges.filter((edge) => edge.type === type);
  },
  
  // 获取节点数量
  getNodeCount: () => {
    return get().nodes.length;
  },
  
  // 获取边数量
  getEdgeCount: () => {
    return get().edges.length;
  },
}));
