import { create } from 'zustand';
import { ValidationError, Node, Edge, NodeType, EdgeType } from '../types';

interface ValidationStore {
  // 状态
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
  
  // 操作
  validateNode: (node: Node, nodeType?: NodeType) => ValidationError[];
  validateEdge: (edge: Edge, edgeType?: EdgeType) => ValidationError[];
  validateGraph: (nodes: Node[], edges: Edge[]) => ValidationError[];
  addError: (error: ValidationError) => void;
  addWarning: (warning: ValidationError) => void;
  addInfo: (info: ValidationError) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  clearWarnings: () => void;
  clearInfo: () => void;
  clearAll: () => void;
  
  // 辅助方法
  getErrorCount: () => number;
  getWarningCount: () => number;
  getInfoCount: () => number;
  hasErrors: () => boolean;
  hasWarnings: () => boolean;
  hasInfo: () => boolean;
  getErrorsByEntity: (entityId: string) => ValidationError[];
  getWarningsByEntity: (entityId: string) => ValidationError[];
  getInfoByEntity: (entityId: string) => ValidationError[];
}

export const useValidationStore = create<ValidationStore>((set, get) => ({
  // 初始状态
  errors: [],
  warnings: [],
  info: [],
  
  // 验证节点
  validateNode: (node, nodeType) => {
    const errors: ValidationError[] = [];
    
    // 检查节点必填属性
    if (!node.label || node.label.trim() === '') {
      errors.push({
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'node',
        entityId: node.id,
        message: '节点标签不能为空',
        severity: 'error',
        timestamp: new Date().toISOString(),
      });
    }
    
    // 检查节点类型是否存在
    if (!node.type) {
      errors.push({
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'node',
        entityId: node.id,
        message: '节点类型不能为空',
        severity: 'error',
        timestamp: new Date().toISOString(),
      });
    }
    
    // 检查节点位置
    if (isNaN(node.x) || isNaN(node.y)) {
      errors.push({
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'node',
        entityId: node.id,
        message: '节点位置无效',
        severity: 'error',
        timestamp: new Date().toISOString(),
      });
    }
    
    // 如果提供了节点类型，检查属性
    if (nodeType) {
      nodeType.properties.forEach((property) => {
        if (property.required && !(property.name in node.properties)) {
          errors.push({
            id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'property',
            entityId: node.id,
            message: `属性 "${property.name}" 是必填的`,
            severity: 'error',
            timestamp: new Date().toISOString(),
          });
        }
        
        // 检查属性类型
        if (property.name in node.properties) {
          const value = node.properties[property.name];
          switch (property.type) {
            case 'string':
              if (typeof value !== 'string') {
                errors.push({
                  id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  type: 'property',
                  entityId: node.id,
                  message: `属性 "${property.name}" 应该是字符串类型`,
                  severity: 'error',
                  timestamp: new Date().toISOString(),
                });
              } else if (property.validation) {
                if (property.validation.minLength !== undefined && value.length < property.validation.minLength) {
                  errors.push({
                    id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'property',
                    entityId: node.id,
                    message: `属性 "${property.name}" 长度不能小于 ${property.validation.minLength}`,
                    severity: 'error',
                    timestamp: new Date().toISOString(),
                  });
                }
                if (property.validation.maxLength !== undefined && value.length > property.validation.maxLength) {
                  errors.push({
                    id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'property',
                    entityId: node.id,
                    message: `属性 "${property.name}" 长度不能大于 ${property.validation.maxLength}`,
                    severity: 'error',
                    timestamp: new Date().toISOString(),
                  });
                }
                if (property.validation.pattern && !new RegExp(property.validation.pattern).test(value)) {
                  errors.push({
                    id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'property',
                    entityId: node.id,
                    message: `属性 "${property.name}" 不符合正则表达式要求`,
                    severity: 'error',
                    timestamp: new Date().toISOString(),
                  });
                }
              }
              break;
            case 'number':
              if (typeof value !== 'number' || isNaN(value)) {
                errors.push({
                  id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  type: 'property',
                  entityId: node.id,
                  message: `属性 "${property.name}" 应该是数字类型`,
                  severity: 'error',
                  timestamp: new Date().toISOString(),
                });
              } else if (property.validation) {
                if (property.validation.min !== undefined && value < property.validation.min) {
                  errors.push({
                    id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'property',
                    entityId: node.id,
                    message: `属性 "${property.name}" 不能小于 ${property.validation.min}`,
                    severity: 'error',
                    timestamp: new Date().toISOString(),
                  });
                }
                if (property.validation.max !== undefined && value > property.validation.max) {
                  errors.push({
                    id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'property',
                    entityId: node.id,
                    message: `属性 "${property.name}" 不能大于 ${property.validation.max}`,
                    severity: 'error',
                    timestamp: new Date().toISOString(),
                  });
                }
              }
              break;
            case 'boolean':
              if (typeof value !== 'boolean') {
                errors.push({
                  id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  type: 'property',
                  entityId: node.id,
                  message: `属性 "${property.name}" 应该是布尔类型`,
                  severity: 'error',
                  timestamp: new Date().toISOString(),
                });
              }
              break;
            case 'date':
              if (isNaN(Date.parse(value))) {
                errors.push({
                  id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  type: 'property',
                  entityId: node.id,
                  message: `属性 "${property.name}" 应该是有效的日期`,
                  severity: 'error',
                  timestamp: new Date().toISOString(),
                });
              }
              break;
          }
        }
      });
    }
    
    return errors;
  },
  
  // 验证边
  validateEdge: (edge, edgeType) => {
    const errors: ValidationError[] = [];
    
    // 检查边的源节点和目标节点
    if (!edge.source) {
      errors.push({
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'edge',
        entityId: edge.id,
        message: '边的源节点不能为空',
        severity: 'error',
        timestamp: new Date().toISOString(),
      });
    }
    
    if (!edge.target) {
      errors.push({
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'edge',
        entityId: edge.id,
        message: '边的目标节点不能为空',
        severity: 'error',
        timestamp: new Date().toISOString(),
      });
    }
    
    if (edge.source === edge.target) {
      errors.push({
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'edge',
        entityId: edge.id,
        message: '边的源节点和目标节点不能相同',
        severity: 'error',
        timestamp: new Date().toISOString(),
      });
    }
    
    // 检查边标签
    if (!edge.label || edge.label.trim() === '') {
      errors.push({
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'edge',
        entityId: edge.id,
        message: '边标签不能为空',
        severity: 'error',
        timestamp: new Date().toISOString(),
      });
    }
    
    // 检查边类型
    if (!edge.type) {
      errors.push({
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'edge',
        entityId: edge.id,
        message: '边类型不能为空',
        severity: 'error',
        timestamp: new Date().toISOString(),
      });
    }
    
    // 如果提供了边类型，检查属性
    if (edgeType) {
      edgeType.properties.forEach((property) => {
        if (property.required && !(property.name in edge.properties)) {
          errors.push({
            id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'property',
            entityId: edge.id,
            message: `属性 "${property.name}" 是必填的`,
            severity: 'error',
            timestamp: new Date().toISOString(),
          });
        }
        
        // 检查属性类型（与节点属性检查类似）
        if (property.name in edge.properties) {
          const value = edge.properties[property.name];
          switch (property.type) {
            case 'string':
              if (typeof value !== 'string') {
                errors.push({
                  id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  type: 'property',
                  entityId: edge.id,
                  message: `属性 "${property.name}" 应该是字符串类型`,
                  severity: 'error',
                  timestamp: new Date().toISOString(),
                });
              }
              break;
            case 'number':
              if (typeof value !== 'number' || isNaN(value)) {
                errors.push({
                  id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  type: 'property',
                  entityId: edge.id,
                  message: `属性 "${property.name}" 应该是数字类型`,
                  severity: 'error',
                  timestamp: new Date().toISOString(),
                });
              }
              break;
            case 'boolean':
              if (typeof value !== 'boolean') {
                errors.push({
                  id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  type: 'property',
                  entityId: edge.id,
                  message: `属性 "${property.name}" 应该是布尔类型`,
                  severity: 'error',
                  timestamp: new Date().toISOString(),
                });
              }
              break;
            case 'date':
              if (isNaN(Date.parse(value))) {
                errors.push({
                  id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  type: 'property',
                  entityId: edge.id,
                  message: `属性 "${property.name}" 应该是有效的日期`,
                  severity: 'error',
                  timestamp: new Date().toISOString(),
                });
              }
              break;
          }
        }
      });
    }
    
    return errors;
  },
  
  // 验证整个图
  validateGraph: (nodes, edges) => {
    const allErrors: ValidationError[] = [];
    
    // 验证所有节点
    nodes.forEach((node) => {
      const nodeErrors = get().validateNode(node);
      allErrors.push(...nodeErrors);
    });
    
    // 验证所有边
    edges.forEach((edge) => {
      const edgeErrors = get().validateEdge(edge);
      allErrors.push(...edgeErrors);
    });
    
    // 检查边的源节点和目标节点是否存在
    const nodeIds = new Set(nodes.map((node) => node.id));
    edges.forEach((edge) => {
      if (!nodeIds.has(edge.source)) {
        allErrors.push({
          id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'edge',
          entityId: edge.id,
          message: `边的源节点 ${edge.source} 不存在`,
          severity: 'error',
          timestamp: new Date().toISOString(),
        });
      }
      if (!nodeIds.has(edge.target)) {
        allErrors.push({
          id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'edge',
          entityId: edge.id,
          message: `边的目标节点 ${edge.target} 不存在`,
          severity: 'error',
          timestamp: new Date().toISOString(),
        });
      }
    });
    
    // 检查节点ID唯一性
    const nodeIdCount = new Map<string, number>();
    nodes.forEach((node) => {
      nodeIdCount.set(node.id, (nodeIdCount.get(node.id) || 0) + 1);
    });
    nodeIdCount.forEach((count, id) => {
      if (count > 1) {
        allErrors.push({
          id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'node',
          entityId: id,
          message: `节点ID ${id} 重复`,
          severity: 'error',
          timestamp: new Date().toISOString(),
        });
      }
    });
    
    // 检查边ID唯一性
    const edgeIdCount = new Map<string, number>();
    edges.forEach((edge) => {
      edgeIdCount.set(edge.id, (edgeIdCount.get(edge.id) || 0) + 1);
    });
    edgeIdCount.forEach((count, id) => {
      if (count > 1) {
        allErrors.push({
          id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'edge',
          entityId: id,
          message: `边ID ${id} 重复`,
          severity: 'error',
          timestamp: new Date().toISOString(),
        });
      }
    });
    
    return allErrors;
  },
  
  // 添加错误
  addError: (error) => {
    set((state) => ({
      errors: [...state.errors, error],
    }));
  },
  
  // 添加警告
  addWarning: (warning) => {
    set((state) => ({
      warnings: [...state.warnings, warning],
    }));
  },
  
  // 添加信息
  addInfo: (info) => {
    set((state) => ({
      info: [...state.info, info],
    }));
  },
  
  // 移除错误
  removeError: (id) => {
    set((state) => ({
      errors: state.errors.filter((error) => error.id !== id),
      warnings: state.warnings.filter((warning) => warning.id !== id),
      info: state.info.filter((info) => info.id !== id),
    }));
  },
  
  // 清空错误
  clearErrors: () => {
    set({ errors: [] });
  },
  
  // 清空警告
  clearWarnings: () => {
    set({ warnings: [] });
  },
  
  // 清空信息
  clearInfo: () => {
    set({ info: [] });
  },
  
  // 清空所有
  clearAll: () => {
    set({ errors: [], warnings: [], info: [] });
  },
  
  // 获取错误数量
  getErrorCount: () => {
    return get().errors.length;
  },
  
  // 获取警告数量
  getWarningCount: () => {
    return get().warnings.length;
  },
  
  // 获取信息数量
  getInfoCount: () => {
    return get().info.length;
  },
  
  // 检查是否有错误
  hasErrors: () => {
    return get().errors.length > 0;
  },
  
  // 检查是否有警告
  hasWarnings: () => {
    return get().warnings.length > 0;
  },
  
  // 检查是否有信息
  hasInfo: () => {
    return get().info.length > 0;
  },
  
  // 根据实体ID获取错误
  getErrorsByEntity: (entityId) => {
    return get().errors.filter((error) => error.entityId === entityId);
  },
  
  // 根据实体ID获取警告
  getWarningsByEntity: (entityId) => {
    return get().warnings.filter((warning) => warning.entityId === entityId);
  },
  
  // 根据实体ID获取信息
  getInfoByEntity: (entityId) => {
    return get().info.filter((info) => info.entityId === entityId);
  },
}));
