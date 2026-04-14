// 节点类型
export interface Node {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
  x: number;
  y: number;
  size?: number;
  color?: string;
  shape?: string;
  status?: 'normal' | 'selected' | 'hovered';
  createdAt: string;
  updatedAt: string;
}

// 边类型
export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
  properties: Record<string, any>;
  color?: string;
  size?: number;
  status?: 'normal' | 'selected' | 'hovered';
  createdAt: string;
  updatedAt: string;
}

// 节点类型定义
export interface NodeType {
  id: string;
  name: string;
  description: string;
  color: string;
  shape: string;
  defaultSize: number;
  properties: Property[];
  constraints: Constraint[];
  createdAt: string;
  updatedAt: string;
}

// 边类型定义
export interface EdgeType {
  id: string;
  name: string;
  description: string;
  color: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  defaultSize: number;
  properties: Property[];
  constraints: Constraint[];
  sourceTypes: string[];
  targetTypes: string[];
  createdAt: string;
  updatedAt: string;
}

// 类型组
export interface TypeGroup {
  id: string;
  name: string;
  description: string;
  nodeTypeIds: string[];
  edgeTypeIds: string[];
  createdAt: string;
  updatedAt: string;
}

// 本体定义
export interface Ontology {
  id: string;
  name: string;
  description: string;
  nodeTypes: NodeType[];
  edgeTypes: EdgeType[];
  typeGroups: TypeGroup[];
  createdAt: string;
  updatedAt: string;
}

// 属性定义
export interface Property {
  id: string;
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  defaultValue?: any;
  required: boolean;
  unique: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// 约束定义
export interface Constraint {
  id: string;
  type: 'unique' | 'required' | 'range' | 'pattern' | 'custom';
  property?: string;
  value?: any;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// 布局类型
export type LayoutType = 'force' | 'dagre' | 'radial' | 'circular' | 'grid';

// 视图模式
export type ViewMode = 'canvas' | 'ontology' | 'help';

// 选择状态
export interface SelectionState {
  selectedNodes: string[];
  selectedEdges: string[];
  copiedNodes: Node[];
  copiedEdges: Edge[];
}

// 历史记录项
export interface HistoryItem {
  id: string;
  action: 'add' | 'update' | 'delete' | 'move' | 'batch';
  data: any;
  timestamp: string;
}

// 验证错误
export interface ValidationError {
  id: string;
  type: 'node' | 'edge' | 'property';
  entityId: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  timestamp: string;
}

// 导入/导出格式
export type ExportFormat = 'json' | 'csv' | 'json-ld';

// 画布配置
export interface CanvasConfig {
  zoom: number;
  pan: { x: number; y: number };
  minZoom: number;
  maxZoom: number;
  autoFit: boolean;
}

// 样式配置
export interface StyleConfig {
  node: {
    defaultColor: string;
    defaultSize: number;
    defaultShape: string;
    selectedColor: string;
    hoveredColor: string;
  };
  edge: {
    defaultColor: string;
    defaultSize: number;
    defaultLineStyle: 'solid' | 'dashed' | 'dotted';
    selectedColor: string;
    hoveredColor: string;
  };
}

// 大模型配置
export interface LLMConfig {
  enabled: boolean;
  provider: 'openai' | 'azure' | 'anthropic' | 'google' | 'custom';
  apiKey: string;
  endpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

// 图数据库配置
export interface GraphDBConfig {
  enabled: boolean;
  type: 'neo4j' | 'janusgraph' | 'tigergraph' | 'custom';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

// 外部服务配置
export interface ExternalServicesConfig {
  llm: LLMConfig;
  graphDB: GraphDBConfig;
}

// 编辑器配置
export interface EditorConfig {
  canvas: CanvasConfig;
  layout: {
    type: LayoutType;
    options: any;
  };
  view: {
    mode: ViewMode;
    sidePanel: {
      visible: boolean;
      width: number;
    };
  };
  grid: {
    visible: boolean;
    size: number;
    color: string;
  };
  snap: {
    enabled: boolean;
    distance: number;
  };
  style: StyleConfig;
  externalServices: ExternalServicesConfig;
}