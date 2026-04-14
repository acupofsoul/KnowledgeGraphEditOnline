import { create } from 'zustand';
import { LayoutType, ViewMode, SelectionState, EditorConfig } from '../types';

interface UIStore {
  // 状态
  config: EditorConfig;
  selection: SelectionState;
  contextMenu: {
    visible: boolean;
    x: number;
    y: number;
    type: 'node' | 'edge' | 'canvas' | null;
    entityId: string | null;
  };
  ontologyDesigner: {
    visible: boolean;
    activeTab: 'nodeTypes' | 'edgeTypes' | 'typeGroups';
  };
  helpPanel: {
    visible: boolean;
    activeSection: 'getting-started' | 'keyboard-shortcuts' | 'advanced';
  };
  search: {
    query: string;
    results: {
      nodes: string[];
      edges: string[];
    };
    filter: {
      nodeTypes: string[];
      edgeTypes: string[];
      showOnlySelected: boolean;
    };
  };
  
  // 操作
  setLayout: (type: LayoutType, options?: any) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleSidePanel: (visible?: boolean) => void;
  setSidePanelWidth: (width: number) => void;
  setSelection: (selection: Partial<SelectionState>) => void;
  clearSelection: () => void;
  addToSelection: (nodeId?: string, edgeId?: string) => void;
  removeFromSelection: (nodeId?: string, edgeId?: string) => void;
  setContextMenu: (contextMenu: Partial<UIStore['contextMenu']>) => void;
  toggleOntologyDesigner: (visible?: boolean) => void;
  setOntologyDesignerTab: (tab: 'nodeTypes' | 'edgeTypes' | 'typeGroups') => void;
  toggleHelpPanel: (visible?: boolean) => void;
  setHelpPanelSection: (section: 'getting-started' | 'keyboard-shortcuts' | 'advanced') => void;
  setCanvasZoom: (zoom: number) => void;
  setCanvasPan: (pan: { x: number; y: number }) => void;
  setCanvasAutoFit: (autoFit: boolean) => void;
  toggleGrid: (visible?: boolean) => void;
  setGridSize: (size: number) => void;
  setGridColor: (color: string) => void;
  toggleSnap: (enabled?: boolean) => void;
  setSnapDistance: (distance: number) => void;
  
  // 样式操作
  setNodeStyle: (style: Partial<EditorConfig['style']['node']>) => void;
  setEdgeStyle: (style: Partial<EditorConfig['style']['edge']>) => void;
  resetStyle: () => void;
  
  // 搜索和过滤操作
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: { nodes: string[]; edges: string[] }) => void;
  setFilter: (filter: Partial<UIStore['search']['filter']>) => void;
  resetFilter: () => void;
  
  // 辅助方法
  isNodeSelected: (nodeId: string) => boolean;
  isEdgeSelected: (edgeId: string) => boolean;
  getSelectedNodeCount: () => number;
  getSelectedEdgeCount: () => number;
  isSelectionEmpty: () => boolean;
}

// 初始配置
const initialConfig: EditorConfig = {
  canvas: {
    zoom: 1,
    pan: { x: 0, y: 0 },
    minZoom: 0.1,
    maxZoom: 5,
    autoFit: false,
  },
  layout: {
    type: 'force',
    options: {
      center: [300, 300],
      linkDistance: 100,
      charge: -300,
      gravity: 0.1,
    },
  },
  view: {
    mode: 'canvas',
    sidePanel: {
      visible: true,
      width: 300,
    },
  },
  grid: {
    visible: true,
    size: 20,
    color: '#f0f0f0',
  },
  snap: {
    enabled: true,
    distance: 5,
  },
  style: {
    node: {
      defaultColor: '#1890ff',
      defaultSize: 40,
      defaultShape: 'circle',
      selectedColor: '#ff4d4f',
      hoveredColor: '#52c41a',
    },
    edge: {
      defaultColor: '#8c8c8c',
      defaultSize: 2,
      defaultLineStyle: 'solid',
      selectedColor: '#ff4d4f',
      hoveredColor: '#52c41a',
    },
  },
};

// 初始选择状态
const initialSelection: SelectionState = {
  selectedNodes: [],
  selectedEdges: [],
  copiedNodes: [],
  copiedEdges: [],
};

// 初始搜索状态
const initialSearch = {
  query: '',
  results: {
    nodes: [],
    edges: [],
  },
  filter: {
    nodeTypes: [],
    edgeTypes: [],
    showOnlySelected: false,
  },
};

export const useUIStore = create<UIStore>((set, get) => ({
  // 初始状态
  config: initialConfig,
  selection: initialSelection,
  contextMenu: {
    visible: false,
    x: 0,
    y: 0,
    type: null,
    entityId: null,
  },
  ontologyDesigner: {
    visible: false,
    activeTab: 'nodeTypes',
  },
  helpPanel: {
    visible: false,
    activeSection: 'getting-started',
  },
  search: initialSearch,
  
  // 设置布局
  setLayout: (type, options) => {
    set((state) => ({
      config: {
        ...state.config,
        layout: {
          type,
          options: options || state.config.layout.options,
        },
      },
    }));
  },
  
  // 设置视图模式
  setViewMode: (mode) => {
    set((state) => ({
      config: {
        ...state.config,
        view: {
          ...state.config.view,
          mode,
        },
      },
    }));
  },
  
  // 切换侧边栏
  toggleSidePanel: (visible) => {
    set((state) => ({
      config: {
        ...state.config,
        view: {
          ...state.config.view,
          sidePanel: {
            ...state.config.view.sidePanel,
            visible: visible !== undefined ? visible : !state.config.view.sidePanel.visible,
          },
        },
      },
    }));
  },
  
  // 设置侧边栏宽度
  setSidePanelWidth: (width) => {
    set((state) => ({
      config: {
        ...state.config,
        view: {
          ...state.config.view,
          sidePanel: {
            ...state.config.view.sidePanel,
            width,
          },
        },
      },
    }));
  },
  
  // 设置选择状态
  setSelection: (selection) => {
    set((state) => ({
      selection: {
        ...state.selection,
        ...selection,
      },
    }));
  },
  
  // 清空选择
  clearSelection: () => {
    set({ selection: initialSelection });
  },
  
  // 添加到选择
  addToSelection: (nodeId, edgeId) => {
    set((state) => ({
      selection: {
        ...state.selection,
        selectedNodes: nodeId
          ? [...new Set([...state.selection.selectedNodes, nodeId])]
          : state.selection.selectedNodes,
        selectedEdges: edgeId
          ? [...new Set([...state.selection.selectedEdges, edgeId])]
          : state.selection.selectedEdges,
      },
    }));
  },
  
  // 从选择中移除
  removeFromSelection: (nodeId, edgeId) => {
    set((state) => ({
      selection: {
        ...state.selection,
        selectedNodes: nodeId
          ? state.selection.selectedNodes.filter((id) => id !== nodeId)
          : state.selection.selectedNodes,
        selectedEdges: edgeId
          ? state.selection.selectedEdges.filter((id) => id !== edgeId)
          : state.selection.selectedEdges,
      },
    }));
  },
  
  // 设置上下文菜单
  setContextMenu: (contextMenu) => {
    set((state) => ({
      contextMenu: {
        ...state.contextMenu,
        ...contextMenu,
      },
    }));
  },
  
  // 切换本体设计器
  toggleOntologyDesigner: (visible) => {
    set((state) => ({
      ontologyDesigner: {
        ...state.ontologyDesigner,
        visible: visible !== undefined ? visible : !state.ontologyDesigner.visible,
      },
    }));
  },
  
  // 设置本体设计器标签
  setOntologyDesignerTab: (tab) => {
    set((state) => ({
      ontologyDesigner: {
        ...state.ontologyDesigner,
        activeTab: tab,
      },
    }));
  },
  
  // 切换帮助面板
  toggleHelpPanel: (visible) => {
    set((state) => ({
      helpPanel: {
        ...state.helpPanel,
        visible: visible !== undefined ? visible : !state.helpPanel.visible,
      },
    }));
  },
  
  // 设置帮助面板 section
  setHelpPanelSection: (section) => {
    set((state) => ({
      helpPanel: {
        ...state.helpPanel,
        activeSection: section,
      },
    }));
  },
  
  // 设置画布缩放
  setCanvasZoom: (zoom) => {
    set((state) => ({
      config: {
        ...state.config,
        canvas: {
          ...state.config.canvas,
          zoom: Math.max(
            state.config.canvas.minZoom,
            Math.min(state.config.canvas.maxZoom, zoom)
          ),
        },
      },
    }));
  },
  
  // 设置画布平移
  setCanvasPan: (pan) => {
    set((state) => ({
      config: {
        ...state.config,
        canvas: {
          ...state.config.canvas,
          pan,
        },
      },
    }));
  },
  
  // 设置画布自动适应
  setCanvasAutoFit: (autoFit) => {
    set((state) => ({
      config: {
        ...state.config,
        canvas: {
          ...state.config.canvas,
          autoFit,
        },
      },
    }));
  },
  
  // 切换网格
  toggleGrid: (visible) => {
    set((state) => ({
      config: {
        ...state.config,
        grid: {
          ...state.config.grid,
          visible: visible !== undefined ? visible : !state.config.grid.visible,
        },
      },
    }));
  },
  
  // 设置网格大小
  setGridSize: (size) => {
    set((state) => ({
      config: {
        ...state.config,
        grid: {
          ...state.config.grid,
          size,
        },
      },
    }));
  },
  
  // 设置网格颜色
  setGridColor: (color) => {
    set((state) => ({
      config: {
        ...state.config,
        grid: {
          ...state.config.grid,
          color,
        },
      },
    }));
  },
  
  // 切换吸附
  toggleSnap: (enabled) => {
    set((state) => ({
      config: {
        ...state.config,
        snap: {
          ...state.config.snap,
          enabled: enabled !== undefined ? enabled : !state.config.snap.enabled,
        },
      },
    }));
  },
  
  // 设置吸附距离
  setSnapDistance: (distance) => {
    set((state) => ({
      config: {
        ...state.config,
        snap: {
          ...state.config.snap,
          distance,
        },
      },
    }));
  },
  
  // 设置节点样式
  setNodeStyle: (style) => {
    set((state) => ({
      config: {
        ...state.config,
        style: {
          ...state.config.style,
          node: {
            ...state.config.style.node,
            ...style,
          },
        },
      },
    }));
  },
  
  // 设置边样式
  setEdgeStyle: (style) => {
    set((state) => ({
      config: {
        ...state.config,
        style: {
          ...state.config.style,
          edge: {
            ...state.config.style.edge,
            ...style,
          },
        },
      },
    }));
  },
  
  // 重置样式
  resetStyle: () => {
    set((state) => ({
      config: {
        ...state.config,
        style: initialConfig.style,
      },
    }));
  },
  
  // 设置搜索查询
  setSearchQuery: (query) => {
    set((state) => ({
      search: {
        ...state.search,
        query,
      },
    }));
  },
  
  // 设置搜索结果
  setSearchResults: (results) => {
    set((state) => ({
      search: {
        ...state.search,
        results,
      },
    }));
  },
  
  // 设置过滤器
  setFilter: (filter) => {
    set((state) => ({
      search: {
        ...state.search,
        filter: {
          ...state.search.filter,
          ...filter,
        },
      },
    }));
  },
  
  // 重置过滤器
  resetFilter: () => {
    set((state) => ({
      search: {
        ...state.search,
        filter: initialSearch.filter,
      },
    }));
  },
  
  // 检查节点是否被选中
  isNodeSelected: (nodeId) => {
    return get().selection.selectedNodes.includes(nodeId);
  },
  
  // 检查边是否被选中
  isEdgeSelected: (edgeId) => {
    return get().selection.selectedEdges.includes(edgeId);
  },
  
  // 获取选中节点数量
  getSelectedNodeCount: () => {
    return get().selection.selectedNodes.length;
  },
  
  // 获取选中边数量
  getSelectedEdgeCount: () => {
    return get().selection.selectedEdges.length;
  },
  
  // 检查选择是否为空
  isSelectionEmpty: () => {
    const { selectedNodes, selectedEdges } = get().selection;
    return selectedNodes.length === 0 && selectedEdges.length === 0;
  },
}));
