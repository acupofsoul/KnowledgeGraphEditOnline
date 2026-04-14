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
  const { nodes, edges, addNode } = useGraphStore();
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
    
    graphRef.current = graph;
    setIsInitializing(false);
    
    // 清理
    return () => {
      graph.destroy();
    };
  }, [ontology]);
  
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
