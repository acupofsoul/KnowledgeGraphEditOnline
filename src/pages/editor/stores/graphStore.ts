import { create } from 'zustand';
import { Node, Edge, ExportFormat } from '../types';
import { useHistoryStore } from './historyStore';
import { useValidationStore } from './validationStore';

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
  
  // 历史记录操作
  undo: () => void;
  redo: () => void;
  
  // 导入/导出
  importGraph: (data: { nodes: Node[]; edges: Edge[] }) => void;
  exportGraph: (format: ExportFormat) => string;
  exportGraphAsImage: (type: 'png' | 'jpg' | 'svg') => void;
  saveGraph: () => void;
  loadGraph: () => void;
  enableAutoSave: (enabled: boolean) => void;
  
  // 模板操作
  saveTemplate: (name: string) => void;
  loadTemplate: (name: string) => void;
  getTemplates: () => any[];
  deleteTemplate: (name: string) => void;
  
  // 外部服务操作
  importFromGraphDB: () => Promise<void>;
  exportToGraphDB: () => Promise<void>;
  generateGraphFromLLM: (prompt: string) => Promise<void>;
  analyzeGraphWithLLM: (prompt: string) => Promise<string>;
  
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
    
    // 验证新节点
    const validationStore = useValidationStore.getState();
    const nodeErrors = validationStore.validateNode(newNode);
    nodeErrors.forEach(error => {
      if (error.severity === 'error') {
        validationStore.addError(error);
      } else if (error.severity === 'warning') {
        validationStore.addWarning(error);
      } else {
        validationStore.addInfo(error);
      }
    });
    
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
    
    // 验证新边
    const validationStore = useValidationStore.getState();
    const edgeErrors = validationStore.validateEdge(newEdge);
    edgeErrors.forEach(error => {
      if (error.severity === 'error') {
        validationStore.addError(error);
      } else if (error.severity === 'warning') {
        validationStore.addWarning(error);
      } else {
        validationStore.addInfo(error);
      }
    });
    
    return newEdge;
  },
  
  // 更新节点
  updateNode: (id, updates) => {
    set((state) => {
      const updatedNodes = state.nodes.map((node) =>
        node.id === id
          ? { ...node, ...updates, updatedAt: new Date().toISOString() }
          : node
      );
      
      // 验证更新后的节点
      const validationStore = useValidationStore.getState();
      const updatedNode = updatedNodes.find(node => node.id === id);
      if (updatedNode) {
        // 清除该节点的旧验证错误
        const oldErrors = validationStore.getErrorsByEntity(id);
        oldErrors.forEach(error => validationStore.removeError(error.id));
        
        // 验证更新后的节点
        const nodeErrors = validationStore.validateNode(updatedNode);
        nodeErrors.forEach(error => {
          if (error.severity === 'error') {
            validationStore.addError(error);
          } else if (error.severity === 'warning') {
            validationStore.addWarning(error);
          } else {
            validationStore.addInfo(error);
          }
        });
      }
      
      return { nodes: updatedNodes };
    });
  },
  
  // 更新边
  updateEdge: (id, updates) => {
    set((state) => {
      const updatedEdges = state.edges.map((edge) =>
        edge.id === id
          ? { ...edge, ...updates, updatedAt: new Date().toISOString() }
          : edge
      );
      
      // 验证更新后的边
      const validationStore = useValidationStore.getState();
      const updatedEdge = updatedEdges.find(edge => edge.id === id);
      if (updatedEdge) {
        // 清除该边的旧验证错误
        const oldErrors = validationStore.getErrorsByEntity(id);
        oldErrors.forEach(error => validationStore.removeError(error.id));
        
        // 验证更新后的边
        const edgeErrors = validationStore.validateEdge(updatedEdge);
        edgeErrors.forEach(error => {
          if (error.severity === 'error') {
            validationStore.addError(error);
          } else if (error.severity === 'warning') {
            validationStore.addWarning(error);
          } else {
            validationStore.addInfo(error);
          }
        });
      }
      
      return { edges: updatedEdges };
    });
  },
  
  // 删除节点
  deleteNode: (id) => {
    set((state) => {
      const deletedNodeEdges = state.edges.filter((edge) => edge.source === id || edge.target === id);
      const deletedEdgeIds = deletedNodeEdges.map(edge => edge.id);
      
      // 清除该节点及其相关边的验证错误
      const validationStore = useValidationStore.getState();
      const nodeErrors = validationStore.getErrorsByEntity(id);
      nodeErrors.forEach(error => validationStore.removeError(error.id));
      
      deletedEdgeIds.forEach(edgeId => {
        const edgeErrors = validationStore.getErrorsByEntity(edgeId);
        edgeErrors.forEach(error => validationStore.removeError(error.id));
      });
      
      return {
        nodes: state.nodes.filter((node) => node.id !== id),
        edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
      };
    });
  },
  
  // 删除边
  deleteEdge: (id) => {
    set((state) => {
      // 清除该边的验证错误
      const validationStore = useValidationStore.getState();
      const edgeErrors = validationStore.getErrorsByEntity(id);
      edgeErrors.forEach(error => validationStore.removeError(error.id));
      
      return {
        edges: state.edges.filter((edge) => edge.id !== id),
      };
    });
  },
  
  // 删除选中的节点和边
  deleteSelected: (nodeIds, edgeIds) => {
    set((state) => {
      const deletedNodeEdges = state.edges.filter((edge) => 
        nodeIds.includes(edge.source) || nodeIds.includes(edge.target)
      );
      const deletedEdgeIds = [...edgeIds, ...deletedNodeEdges.map(edge => edge.id)];
      
      // 清除选中节点和边的验证错误
      const validationStore = useValidationStore.getState();
      
      // 清除节点的验证错误
      nodeIds.forEach(nodeId => {
        const nodeErrors = validationStore.getErrorsByEntity(nodeId);
        nodeErrors.forEach(error => validationStore.removeError(error.id));
      });
      
      // 清除边的验证错误
      deletedEdgeIds.forEach(edgeId => {
        const edgeErrors = validationStore.getErrorsByEntity(edgeId);
        edgeErrors.forEach(error => validationStore.removeError(error.id));
      });
      
      return {
        nodes: state.nodes.filter((node) => !nodeIds.includes(node.id)),
        edges: state.edges.filter((edge) => 
          !edgeIds.includes(edge.id) && 
          !nodeIds.includes(edge.source) && 
          !nodeIds.includes(edge.target)
        ),
      };
    });
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
    const { nodes, edges } = get();
    const historyStore = useHistoryStore.getState();
    const validationStore = useValidationStore.getState();
    
    // 记录历史记录
    historyStore.addHistoryItem('delete', {
      type: 'all',
      data: { nodes, edges },
    });
    
    // 清除所有验证错误
    validationStore.clearAll();
    
    set({ nodes: [], edges: [] });
  },
  
  // 撤销
  undo: () => {
    const historyStore = useHistoryStore.getState();
    const item = historyStore.undo();
    if (!item) return;
    
    const { nodes, edges } = get();
    
    switch (item.action) {
      case 'add':
        if (item.data.type === 'node') {
          // 撤销添加节点
          set({ nodes: nodes.filter(node => node.id !== item.data.id) });
        } else if (item.data.type === 'edge') {
          // 撤销添加边
          set({ edges: edges.filter(edge => edge.id !== item.data.id) });
        }
        break;
      case 'delete':
        if (item.data.type === 'node') {
          // 撤销删除节点
          set({ nodes: [...nodes, item.data.node] });
        } else if (item.data.type === 'edge') {
          // 撤销删除边
          set({ edges: [...edges, item.data.edge] });
        } else if (item.data.type === 'all') {
          // 撤销清空画布
          set({ nodes: item.data.nodes, edges: item.data.edges });
        }
        break;
      case 'update':
        if (item.data.type === 'node') {
          // 撤销更新节点
          set({ nodes: nodes.map(node => node.id === item.data.id ? item.data.oldData : node) });
        } else if (item.data.type === 'edge') {
          // 撤销更新边
          set({ edges: edges.map(edge => edge.id === item.data.id ? item.data.oldData : edge) });
        }
        break;
      case 'move':
        if (item.data.type === 'node') {
          // 撤销移动节点
          set({ nodes: nodes.map(node => node.id === item.data.id ? { ...node, x: node.x - item.data.deltaX, y: node.y - item.data.deltaY } : node) });
        }
        break;
      default:
        break;
    }
  },
  
  // 重做
  redo: () => {
    const historyStore = useHistoryStore.getState();
    const item = historyStore.redo();
    if (!item) return;
    
    const { nodes, edges } = get();
    
    switch (item.action) {
      case 'add':
        if (item.data.type === 'node') {
          // 重做添加节点
          set({ nodes: [...nodes, item.data.node] });
        } else if (item.data.type === 'edge') {
          // 重做添加边
          set({ edges: [...edges, item.data.edge] });
        }
        break;
      case 'delete':
        if (item.data.type === 'node') {
          // 重做删除节点
          set({ nodes: nodes.filter(node => node.id !== item.data.node.id) });
        } else if (item.data.type === 'edge') {
          // 重做删除边
          set({ edges: edges.filter(edge => edge.id !== item.data.edge.id) });
        } else if (item.data.type === 'all') {
          // 重做清空画布
          set({ nodes: [], edges: [] });
        }
        break;
      case 'update':
        if (item.data.type === 'node') {
          // 重做更新节点
          set({ nodes: nodes.map(node => node.id === item.data.id ? item.data.newData : node) });
        } else if (item.data.type === 'edge') {
          // 重做更新边
          set({ edges: edges.map(edge => edge.id === item.data.id ? item.data.newData : edge) });
        }
        break;
      case 'move':
        if (item.data.type === 'node') {
          // 重做移动节点
          set({ nodes: nodes.map(node => node.id === item.data.id ? { ...node, x: node.x + item.data.deltaX, y: node.y + item.data.deltaY } : node) });
        }
        break;
      default:
        break;
    }
  },
  
  // 导入图
  importGraph: (data) => {
    // 验证数据格式
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      console.error('导入数据格式错误');
      return;
    }
    
    // 确保节点和边都有必要的属性
    const validNodes = data.nodes.map(node => ({
      ...node,
      id: node.id || `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: node.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      properties: node.properties || {},
      x: node.x || Math.random() * 600,
      y: node.y || Math.random() * 400,
    }));
    
    const validEdges = data.edges.map(edge => ({
      ...edge,
      id: edge.id || `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: edge.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      properties: edge.properties || {},
    }));
    
    set({ nodes: validNodes, edges: validEdges });
    
    // 清除旧的验证错误
    const validationStore = useValidationStore.getState();
    validationStore.clearAll();
    
    // 验证导入的节点和边
    validNodes.forEach(node => {
      const nodeErrors = validationStore.validateNode(node);
      nodeErrors.forEach(error => {
        if (error.severity === 'error') {
          validationStore.addError(error);
        } else if (error.severity === 'warning') {
          validationStore.addWarning(error);
        } else {
          validationStore.addInfo(error);
        }
      });
    });
    
    validEdges.forEach(edge => {
      const edgeErrors = validationStore.validateEdge(edge);
      edgeErrors.forEach(error => {
        if (error.severity === 'error') {
          validationStore.addError(error);
        } else if (error.severity === 'warning') {
          validationStore.addWarning(error);
        } else {
          validationStore.addInfo(error);
        }
      });
    });
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
              ...Object.entries(node.properties).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
            })),
            ...edges.map(edge => ({
              '@id': `#${edge.id}`,
              '@type': edge.type,
              'rdf:subject': `#${edge.source}`,
              'rdf:predicate': edge.label,
              'rdf:object': `#${edge.target}`,
              ...Object.entries(edge.properties).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
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
  
  // 保存图谱到本地存储
  saveGraph: () => {
    const { nodes, edges } = get();
    try {
      localStorage.setItem('knowledge-graph', JSON.stringify({ nodes, edges }));
      console.log('图谱已保存到本地存储');
    } catch (error) {
      console.error('保存图谱失败:', error);
    }
  },
  
  // 从本地存储加载图谱
  loadGraph: () => {
    try {
      const savedGraph = localStorage.getItem('knowledge-graph');
      if (savedGraph) {
        const { nodes, edges } = JSON.parse(savedGraph);
        set({ nodes, edges });
        console.log('图谱已从本地存储加载');
      }
    } catch (error) {
      console.error('加载图谱失败:', error);
    }
  },
  
  // 自动保存图谱
  enableAutoSave: (enabled: boolean) => {
    // 这里需要实现自动保存的逻辑
    // 可以使用节流函数来避免频繁保存
    console.log(`自动保存已${enabled ? '开启' : '关闭'}`);
  },
  
  // 导出图谱为图片
  exportGraphAsImage: (type) => {
    // 这里需要使用 G6 实例的导出功能
    // 由于 G6 实例在 Canvas 组件中，我们需要通过事件或其他方式触发导出
    // 这里只是一个占位实现，实际实现需要与 Canvas 组件集成
    console.log(`导出图谱为${type}格式的图片`);
    // 实际实现时，需要获取 G6 实例并调用其 toDataURL 方法
    // 例如：const dataURL = graph.toDataURL({ type: `image/${type}`, ...options });
  },
  
  // 保存图谱模板
  saveTemplate: (name: string) => {
    try {
      const { nodes, edges } = get();
      const templates = JSON.parse(localStorage.getItem('graph-templates') || '[]');
      templates.push({ name, nodes, edges, createdAt: new Date().toISOString() });
      localStorage.setItem('graph-templates', JSON.stringify(templates));
      console.log(`模板 ${name} 已保存`);
    } catch (error) {
      console.error('保存模板失败:', error);
    }
  },
  
  // 加载图谱模板
  loadTemplate: (name: string) => {
    try {
      const templates = JSON.parse(localStorage.getItem('graph-templates') || '[]');
      const template = templates.find((t: any) => t.name === name);
      if (template) {
        set({ nodes: template.nodes, edges: template.edges });
        console.log(`模板 ${name} 已加载`);
      }
    } catch (error) {
      console.error('加载模板失败:', error);
    }
  },
  
  // 获取所有模板
  getTemplates: () => {
    try {
      return JSON.parse(localStorage.getItem('graph-templates') || '[]');
    } catch (error) {
      console.error('获取模板失败:', error);
      return [];
    }
  },
  
  // 删除模板
  deleteTemplate: (name: string) => {
    try {
      const templates = JSON.parse(localStorage.getItem('graph-templates') || '[]');
      const filteredTemplates = templates.filter((t: any) => t.name !== name);
      localStorage.setItem('graph-templates', JSON.stringify(filteredTemplates));
      console.log(`模板 ${name} 已删除`);
    } catch (error) {
      console.error('删除模板失败:', error);
    }
  },
  
  // 从图数据库导入数据
  importFromGraphDB: async () => {
    try {
      console.log('从图数据库导入数据...');
      // 这里需要实现实际的导入逻辑
      // 例如：连接到图数据库，执行查询，将结果转换为图谱数据
      // 这里只是一个占位实现
    } catch (error) {
      console.error('从图数据库导入失败:', error);
    }
  },
  
  // 导出数据到图数据库
  exportToGraphDB: async () => {
    try {
      const { nodes, edges } = get();
      console.log('导出数据到图数据库...');
      // 这里需要实现实际的导出逻辑
      // 例如：连接到图数据库，将图谱数据转换为数据库操作，执行写入
      // 这里只是一个占位实现
    } catch (error) {
      console.error('导出到图数据库失败:', error);
    }
  },
  
  // 使用大模型生成图谱
  generateGraphFromLLM: async (prompt: string) => {
    try {
      console.log('使用大模型生成图谱...');
      // 这里需要实现实际的生成逻辑
      // 例如：调用大模型API，解析响应，转换为图谱数据
      // 这里只是一个占位实现
    } catch (error) {
      console.error('使用大模型生成图谱失败:', error);
    }
  },
  
  // 使用大模型分析图谱
  analyzeGraphWithLLM: async (prompt: string) => {
    try {
      const { nodes, edges } = get();
      console.log('使用大模型分析图谱...');
      // 这里需要实现实际的分析逻辑
      // 例如：调用大模型API，传递图谱数据和分析提示，获取分析结果
      // 这里只是一个占位实现
      return '分析结果将显示在这里';
    } catch (error) {
      console.error('使用大模型分析图谱失败:', error);
      return '分析失败';
    }
  },
}));
