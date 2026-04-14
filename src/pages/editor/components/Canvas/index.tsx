import React, { useRef, useEffect, useState } from 'react';
import * as G6 from '@antv/g6';
import { useGraphStore } from '../../stores/graphStore';
import { useUIStore } from '../../stores/uiStore';
import { useOntologyStore } from '../../stores/ontologyStore';
import { useHistoryStore } from '../../stores/historyStore';
import './index.less';

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<G6.Graph | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // 状态管理
  const { nodes, edges, addNode, addEdge, updateNode, updateEdge, moveNodes, deleteSelected } = useGraphStore();
  const {
    config,
    selection,
    setSelection,
    clearSelection,
    addToSelection,
    setContextMenu,
  } = useUIStore();
  const { ontology } = useOntologyStore();
  const { addHistoryItem } = useHistoryStore();
  
  // 初始化图表
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // 创建图表
    const graph = new G6.Graph({
      container: canvasRef.current,
      width: canvasRef.current.clientWidth,
      height: canvasRef.current.clientHeight,
      node: {
        type: 'rect',
        style: {
          fill: '#1890ff',
          stroke: '#fff',
          lineWidth: 1,
          radius: 4,
        },
      },
      edge: {
        type: 'line',
        style: {
          stroke: '#faad14',
          lineWidth: 2,
          endArrow: true,
        },
      },
      layout: {
        type: config.layout.type,
        ...config.layout.options,
      },
    });
    
    // 监听事件
    graph.on('node:click', (evt: any) => {
      const { item } = evt;
      if (!item) return;
      
      const nodeId = item.getModel().id;
      
      if (evt.event.ctrlKey || evt.event.metaKey) {
        addToSelection(nodeId);
      } else {
        setSelection({ selectedNodes: [nodeId], selectedEdges: [] });
      }
    });
    
    graph.on('edge:click', (evt: any) => {
      const { item } = evt;
      if (!item) return;
      
      const edgeId = item.getModel().id;
      
      if (evt.event.ctrlKey || evt.event.metaKey) {
        addToSelection(undefined, edgeId);
      } else {
        setSelection({ selectedNodes: [], selectedEdges: [edgeId] });
      }
    });
    
    graph.on('canvas:click', (evt: any) => {
      const { item } = evt;
      if (!item) {
        clearSelection();
        setContextMenu({ visible: false });
      }
    });
    
    // 节点拖拽移动
    graph.on('node:dragend', (evt: any) => {
      const { item, x, y } = evt;
      if (!item) return;
      
      const nodeId = item.getModel().id;
      const model = item.getModel();
      const deltaX = x - model.x;
      const deltaY = y - model.y;
      
      moveNodes([nodeId], deltaX, deltaY);
      
      addHistoryItem('move', {
        type: 'node',
        id: nodeId,
        data: { deltaX, deltaY },
      });
    });
    
    // 双击节点重命名
    graph.on('node:dblclick', (evt: any) => {
      const { item } = evt;
      if (!item) return;
      
      const nodeId = item.getModel().id;
      const currentLabel = item.getModel().label;
      
      // 创建输入框
      const input = document.createElement('input');
      input.type = 'text';
      input.value = currentLabel;
      input.style.position = 'absolute';
      input.style.zIndex = '1000';
      input.style.padding = '4px';
      input.style.border = '1px solid #1890ff';
      input.style.borderRadius = '4px';
      input.style.fontSize = '14px';
      
      // 定位输入框
      const bbox = item.getBBox();
      input.style.left = `${bbox.x}px`;
      input.style.top = `${bbox.y}px`;
      input.style.width = `${bbox.width}px`;
      
      // 添加到画布
      canvasRef.current?.appendChild(input);
      
      // 聚焦并选中文字
      input.focus();
      input.select();
      
      // 处理输入完成
      const handleInputComplete = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          updateNode(nodeId, { label: input.value });
          addHistoryItem('update', {
            type: 'node',
            id: nodeId,
            data: { label: input.value },
          });
          canvasRef.current?.removeChild(input);
        } else if (e.key === 'Escape') {
          canvasRef.current?.removeChild(input);
        }
      };
      
      // 处理点击外部
      const handleClickOutside = (e: MouseEvent) => {
        if (e.target !== input) {
          updateNode(nodeId, { label: input.value });
          addHistoryItem('update', {
            type: 'node',
            id: nodeId,
            data: { label: input.value },
          });
          canvasRef.current?.removeChild(input);
          document.removeEventListener('click', handleClickOutside);
        }
      };
      
      input.addEventListener('keydown', handleInputComplete);
      document.addEventListener('click', handleClickOutside);
    });
    
    // 双击边编辑
    graph.on('edge:dblclick', (evt: any) => {
      const { item } = evt;
      if (!item) return;
      
      const edgeId = item.getModel().id;
      const currentLabel = item.getModel().label;
      
      // 创建输入框
      const input = document.createElement('input');
      input.type = 'text';
      input.value = currentLabel;
      input.style.position = 'absolute';
      input.style.zIndex = '1000';
      input.style.padding = '4px';
      input.style.border = '1px solid #1890ff';
      input.style.borderRadius = '4px';
      input.style.fontSize = '14px';
      
      // 定位输入框到边的中间位置
      const bbox = item.getBBox();
      input.style.left = `${bbox.x + bbox.width / 2 - 50}px`;
      input.style.top = `${bbox.y - 20}px`;
      input.style.width = '100px';
      
      // 添加到画布
      canvasRef.current?.appendChild(input);
      
      // 聚焦并选中文字
      input.focus();
      input.select();
      
      // 处理输入完成
      const handleInputComplete = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          updateEdge(edgeId, { label: input.value });
          addHistoryItem('update', {
            type: 'edge',
            id: edgeId,
            data: { label: input.value },
          });
          canvasRef.current?.removeChild(input);
        } else if (e.key === 'Escape') {
          canvasRef.current?.removeChild(input);
        }
      };
      
      // 处理点击外部
      const handleClickOutside = (e: MouseEvent) => {
        if (e.target !== input) {
          updateEdge(edgeId, { label: input.value });
          addHistoryItem('update', {
            type: 'edge',
            id: edgeId,
            data: { label: input.value },
          });
          canvasRef.current?.removeChild(input);
          document.removeEventListener('click', handleClickOutside);
        }
      };
      
      input.addEventListener('keydown', handleInputComplete);
      document.addEventListener('click', handleClickOutside);
    });
    
    // 边的创建
    graph.on('node:dragstart', (evt: any) => {
      const { item } = evt;
      if (!item) return;
      
      (graph as any).sourceNode = item;
    });
    
    graph.on('node:drop', (evt: any) => {
      const { item } = evt;
      if (!item) return;
      
      const sourceNode = (graph as any).sourceNode;
      if (sourceNode && sourceNode !== item) {
        const sourceId = sourceNode.getModel().id;
        const targetId = item.getModel().id;
        
        // 检查是否已存在相同的边
        const existingEdge = edges.find(
          edge => edge.source === sourceId && edge.target === targetId
        );
        
        if (!existingEdge) {
          addEdge({
            source: sourceId,
            target: targetId,
            label: '关系',
            type: ontology.edgeTypes[0].id,
            properties: {},
          });
          
          addHistoryItem('add', {
            type: 'edge',
            data: { source: sourceId, target: targetId },
          });
        }
      }
      
      (graph as any).sourceNode = null;
    });
    
    graph.on('canvas:drop', () => {
      (graph as any).sourceNode = null;
    });
    
    // 键盘事件处理
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selection.selectedNodes.length > 0 || selection.selectedEdges.length > 0) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          deleteSelected(selection.selectedNodes, selection.selectedEdges);
          addHistoryItem('delete', {
            type: 'multiple',
            data: { nodes: selection.selectedNodes, edges: selection.selectedEdges },
          });
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    graphRef.current = graph;
    setIsInitializing(false);
    
    // 清理
    return () => {
      graph.destroy();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ontology, edges, moveNodes, updateNode, addEdge, deleteSelected, addHistoryItem, selection, setSelection, clearSelection, addToSelection, setContextMenu]);
  
  // 更新图表数据
  useEffect(() => {
    if (isInitializing || !graphRef.current) return;
    
    const graph = graphRef.current;
    
    // 转换数据格式
    const g6Nodes = nodes.map((node) => ({
      ...node,
      style: {
        fill: node.color || ontology.nodeTypes.find(t => t.id === node.type)?.color || '#1890ff',
        stroke: selection.selectedNodes.includes(node.id) ? '#1890ff' : '#fff',
        lineWidth: selection.selectedNodes.includes(node.id) ? 2 : 1,
      },
      label: node.label,
    }));
    
    const g6Edges = edges.map((edge) => ({
      ...edge,
      style: {
        stroke: edge.color || ontology.edgeTypes.find(t => t.id === edge.type)?.color || '#faad14',
        lineWidth: 2,
      },
      label: edge.label,
    }));
    
    graph.updateData({
      nodes: g6Nodes,
      edges: g6Edges,
    });
  }, [nodes, edges, selection, isInitializing, ontology]);
  
  // 处理布局变化
  useEffect(() => {
    if (isInitializing || !graphRef.current) return;
    
    const graph = graphRef.current;
    
    // 重新渲染图表以应用新布局
    graph.render();
  }, [config.layout, isInitializing]);
  
  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !graphRef.current) return;
      
      const graph = graphRef.current;
      graph.setSize(
        canvasRef.current.clientWidth,
        canvasRef.current.clientHeight
      );
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 处理画布点击，添加新节点
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      // 点击空白处，添加新节点
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        addNode({
          label: '新节点',
          type: ontology.nodeTypes[0].id,
          properties: {},
          x,
          y,
        });
        
        addHistoryItem('add', {
          type: 'node',
          data: { x, y },
        });
      }
    }
  };
  
  return (
    <div 
      ref={canvasRef} 
      className="canvas-container"
      onClick={handleCanvasClick}
    />
  );
};

export default Canvas;
