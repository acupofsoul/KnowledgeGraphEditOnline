import { create } from 'zustand';
import { HistoryItem } from '../types';

interface HistoryStore {
  // 状态
  history: HistoryItem[];
  currentIndex: number;
  isUndoing: boolean;
  isRedoing: boolean;
  
  // 操作
  addHistoryItem: (action: HistoryItem['action'], data: any) => void;
  undo: () => HistoryItem | null;
  redo: () => HistoryItem | null;
  clearHistory: () => void;
  
  // 辅助方法
  canUndo: () => boolean;
  canRedo: () => boolean;
  getUndoAction: () => string | null;
  getRedoAction: () => string | null;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  // 初始状态
  history: [],
  currentIndex: -1,
  isUndoing: false,
  isRedoing: false,
  
  // 添加历史记录项
  addHistoryItem: (action, data) => {
    const { history, currentIndex, isUndoing, isRedoing } = get();
    
    // 如果正在撤销或重做，不添加新的历史记录
    if (isUndoing || isRedoing) {
      return;
    }
    
    // 截断历史记录到当前索引
    const newHistory = history.slice(0, currentIndex + 1);
    
    // 创建新的历史记录项
    const newItem: HistoryItem = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      data,
      timestamp: new Date().toISOString(),
    };
    
    set({
      history: [...newHistory, newItem],
      currentIndex: newHistory.length,
    });
  },
  
  // 撤销
  undo: () => {
    const { history, currentIndex } = get();
    
    if (currentIndex < 0) {
      return null;
    }
    
    set({ isUndoing: true });
    
    const item = history[currentIndex];
    set({
      currentIndex: currentIndex - 1,
      isUndoing: false,
    });
    
    return item;
  },
  
  // 重做
  redo: () => {
    const { history, currentIndex } = get();
    
    if (currentIndex >= history.length - 1) {
      return null;
    }
    
    set({ isRedoing: true });
    
    const item = history[currentIndex + 1];
    set({
      currentIndex: currentIndex + 1,
      isRedoing: false,
    });
    
    return item;
  },
  
  // 清空历史记录
  clearHistory: () => {
    set({
      history: [],
      currentIndex: -1,
    });
  },
  
  // 检查是否可以撤销
  canUndo: () => {
    return get().currentIndex >= 0;
  },
  
  // 检查是否可以重做
  canRedo: () => {
    const { history, currentIndex } = get();
    return currentIndex < history.length - 1;
  },
  
  // 获取撤销操作的描述
  getUndoAction: () => {
    const { history, currentIndex } = get();
    if (currentIndex < 0) return null;
    
    const item = history[currentIndex];
    switch (item.action) {
      case 'add':
        return '删除';
      case 'delete':
        return '恢复';
      case 'update':
        return '撤销修改';
      case 'move':
        return '撤销移动';
      case 'batch':
        return '撤销批量操作';
      default:
        return '撤销';
    }
  },
  
  // 获取重做操作的描述
  getRedoAction: () => {
    const { history, currentIndex } = get();
    if (currentIndex >= history.length - 1) return null;
    
    const item = history[currentIndex + 1];
    switch (item.action) {
      case 'add':
        return '添加';
      case 'delete':
        return '删除';
      case 'update':
        return '重做修改';
      case 'move':
        return '重做移动';
      case 'batch':
        return '重做批量操作';
      default:
        return '重做';
    }
  },
}));
