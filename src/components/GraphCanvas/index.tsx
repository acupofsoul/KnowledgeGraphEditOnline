import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Graph } from '@antv/g6';
import { IGraphData } from '@/types';
import { Dropdown, MenuProps, Input } from 'antd';
import GraphToolbar from '../GraphToolbar';
import GraphSearch from '../GraphSearch';
import HelpOverlay from '../HelpOverlay';

interface GraphCanvasProps {
  data: IGraphData;
  onSelect: (type: 'node' | 'edge' | null, id: string | null) => void;
  onAddNode: (x: number, y: number) => void;
  onAddEdge: (source: string, target: string) => void;
  onDelete: (type: 'node' | 'edge', id: string) => void;
  onUpdatePositions: (positions: Record<string, { x: number; y: number }>) => void;
  onUpdateLabel: (type: 'node' | 'edge', id: string, label: string) => void;
  // Toolbar props
  layout: string;
  onLayoutChange: (layout: string) => void;
  onLayoutExecute: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const GraphCanvas = forwardRef<any, GraphCanvasProps>(({ 
  data, 
  onSelect, 
  onAddNode,
  onAddEdge, 
  onDelete,
  onUpdatePositions,
  onUpdateLabel,
  layout,
  onLayoutChange,
  onLayoutExecute,
  onExport,
  onImport,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  
  // Context Menu State
  const [contextMenuState, setContextMenuState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    type: 'node' | 'edge' | null;
    id: string | null;
  }>({ visible: false, x: 0, y: 0, type: null, id: null });

  // In-place Editing State
  const [editingState, setEditingState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    value: string;
    type: 'node' | 'edge' | null;
    id: string | null;
  }>({ visible: false, x: 0, y: 0, value: '', type: null, id: null });

  useImperativeHandle(ref, () => ({
    getGraph: () => graphRef.current,
  }));

  // Handle Layout Change
  useEffect(() => {
    if (!graphRef.current) return;
    
    let layoutConfig: any;
    switch (layout) {
        case 'force':
            layoutConfig = { 
                type: 'force', 
                preventOverlap: true, 
                nodeSize: 50,
                linkDistance: 150,
                nodeStrength: 1000,
                edgeStrength: 200
            };
            break;
        case 'dagre':
            layoutConfig = { 
                type: 'dagre', 
                rankdir: 'LR', 
                align: 'UL', 
                nodesep: 50, 
                ranksep: 70 
            };
            break;
        case 'circular':
            layoutConfig = { 
                type: 'circular',
                radius: 200
            };
            break;
        case 'grid':
            layoutConfig = {
                type: 'grid',
                width: 600,
                height: 400
            };
            break;
        default:
            layoutConfig = { type: 'force' };
    }
    
    graphRef.current.setLayout(layoutConfig);
    // graph.layout() in v5 is async, but we can't await in useEffect
    // We catch the promise to avoid unhandled rejection if graph is destroyed
    graphRef.current.layout().catch(() => {});
  }, [layout]);

  // Initialize Graph
  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: 600,
      data,
      node: {
        type: 'circle',
        style: {
          size: 50,
          fill: '#E6F7FF',
          stroke: '#1890FF',
          lineWidth: 2,
          shadowColor: 'rgba(24, 144, 255, 0.2)',
          shadowBlur: 10,
          labelPlacement: 'bottom',
          labelFill: '#1F1F1F',
          labelFontSize: 12,
          labelBackground: false,
          ports: [{ placement: 'top' }, { placement: 'bottom' }, { placement: 'left' }, { placement: 'right' }],
          iconFontSize: 24,
          iconFill: '#1890FF',
        },
        palette: {
            field: 'labelText',
            color: ['#1890FF', '#F04864', '#2FC25B', '#FACC14', '#13C2C2', '#8543E0'],
        },
        state: {
            selected: {
                stroke: '#0050B3',
                lineWidth: 4,
                shadowColor: 'rgba(0, 80, 179, 0.4)',
                shadowBlur: 20,
            },
            active: {
                stroke: '#1890FF',
                lineWidth: 3,
            },
            inactive: {
                opacity: 0.1,
                labelOpacity: 0.1,
            }
        }
      },
      edge: {
        type: 'line',
        style: {
          stroke: '#A3B1BF',
          lineWidth: 2,
          endArrow: true,
          labelBackground: true,
          labelBackgroundFill: '#FFFFFF',
          labelBackgroundRadius: 4,
          labelFill: '#666',
          labelFontSize: 10,
        },
        state: {
            selected: {
                stroke: '#1890FF',
                lineWidth: 3,
                shadowColor: 'rgba(24, 144, 255, 0.2)',
                shadowBlur: 5,
            },
            active: {
                stroke: '#1890FF',
                lineWidth: 3,
            }
        }
      },
      layout: undefined, 
      behaviors: [
        'drag-canvas',
        'zoom-canvas',
        'drag-element',
        {
          type: 'create-edge',
          trigger: 'drag', 
        },
        'click-select',
      ],
      plugins: [
          {
            type: 'minimap',
            size: [150, 100],
            className: 'g6-minimap', 
            // Minimap configuration might vary by version
          }
      ],
      autoFit: 'view',
    });

    graph.render();
    graphRef.current = graph;

    // --- Events ---
    graph.on('node:click', (e: any) => {
      onSelect('node', e.target.id);
      setContextMenuState(prev => ({ ...prev, visible: false }));
      setEditingState(prev => ({ ...prev, visible: false }));
    });

    graph.on('edge:click', (e: any) => {
      onSelect('edge', e.target.id);
      setContextMenuState(prev => ({ ...prev, visible: false }));
      setEditingState(prev => ({ ...prev, visible: false }));
    });

    graph.on('canvas:click', () => {
      onSelect(null, null);
      setContextMenuState(prev => ({ ...prev, visible: false }));
      setEditingState(prev => ({ ...prev, visible: false }));
    });

    graph.on('canvas:dblclick', (e: any) => {
        const { client } = e;
        const point = graph.getCanvasByClient([client.x, client.y]);
        onAddNode(point[0], point[1]);
    });

    graph.on('node:dblclick', (e: any) => {
        const { client } = e;
        const nodeId = e.target.id;
        const nodeData = data.nodes.find(n => n.id === nodeId);
        setEditingState({
            visible: true,
            x: client.x,
            y: client.y,
            value: nodeData?.style?.labelText || '',
            type: 'node',
            id: nodeId
        });
    });

    graph.on('edge:dblclick', (e: any) => {
        const { client } = e;
        const edgeId = e.target.id;
        const edgeData = data.edges.find(edge => edge.id === edgeId);
        setEditingState({
            visible: true,
            x: client.x,
            y: client.y,
            value: edgeData?.style?.labelText || '',
            type: 'edge',
            id: edgeId
        });
    });

    graph.on('node:contextmenu', (e: any) => {
        e.preventDefault();
        const { client } = e;
        setContextMenuState({
            visible: true,
            x: client.x,
            y: client.y,
            type: 'node',
            id: e.target.id
        });
    });

    graph.on('edge:contextmenu', (e: any) => {
        e.preventDefault();
        const { client } = e;
        setContextMenuState({
            visible: true,
            x: client.x,
            y: client.y,
            type: 'edge',
            id: e.target.id
        });
    });

    graph.on('aftercreateedge', (e: any) => {
      const edge = e.edge;
      if (edge) {
        const sourceId = edge.source; 
        const targetId = edge.target; 
        onAddEdge(sourceId, targetId);
        graph.removeData('edge', edge.id);
      }
    });

    graph.on('node:dragend', (e: any) => {
        const positions: Record<string, {x: number, y: number}> = {};
        const nodes = graph.getNodeData();
        nodes.forEach((n: any) => {
            const x = n.style?.x ?? n.x;
            const y = n.style?.y ?? n.y;
            if (x !== undefined && y !== undefined) {
                positions[n.id] = { x, y };
            }
        });
        onUpdatePositions(positions);
    });

    // Keyboard Shortcuts
    // Using containerRef for focus might be tricky, window listener is easier for now
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            // How do we know what is selected? We rely on prop or graph state.
            // But we don't have selectedItem prop here. 
            // We can ask graph for selected items if we used built-in selection.
            // But we manage selection externally via onSelect.
            // It's better to handle keyboard in parent or pass selectedItem here.
            // For now, let's just trigger onDelete if we have contextMenu open or rely on parent.
            // Actually, let's implement keyboard listener in parent (OntologyPage) to be cleaner.
        }
    };
    
    // window.addEventListener('keydown', handleKeyDown);

    const handleResize = () => {
      if (containerRef.current && graphRef.current) {
        graphRef.current.resize(containerRef.current.clientWidth, 600);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      graph.destroy();
      window.removeEventListener('resize', handleResize);
      // window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); 

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.setData(data);
      graphRef.current.render();
    }
  }, [data]);

  const menuItems: MenuProps['items'] = [
      {
          key: 'delete',
          label: 'Delete',
          danger: true,
          onClick: () => {
              if (contextMenuState.type && contextMenuState.id) {
                  onDelete(contextMenuState.type, contextMenuState.id);
                  setContextMenuState(prev => ({ ...prev, visible: false }));
              }
          }
      }
  ];

  const handleSearchSelect = (id: string) => {
      onSelect('node', id);
      if (graphRef.current) {
          // G6 5.0 focus logic
          // Try standard focus if available, otherwise manual translate
          try {
              graphRef.current.focusElement(id);
          } catch (e) {
              console.warn('focusElement not supported', e);
          }
      }
  };

  const handleFilter = (text: string) => {
      if (!graphRef.current) return;
      
      const nodes = graphRef.current.getNodeData();
      const edges = graphRef.current.getEdgeData();
      
      if (!text) {
          graphRef.current.showElement(nodes.map((n: any) => n.id));
          graphRef.current.showElement(edges.map((e: any) => e.id));
          return;
      }
      
      const lowerText = text.toLowerCase();
      const matchedNodes = nodes.filter((n: any) => 
          (n.style?.labelText || n.id).toLowerCase().includes(lowerText)
      );
      const matchedIds = matchedNodes.map((n: any) => n.id);
      
      const unmatchedNodes = nodes.filter((n: any) => !matchedIds.includes(n.id));
      
      // Instead of hiding, we lower opacity to 'ghost' them
      graphRef.current.setElementState(unmatchedNodes.map((n: any) => n.id), 'inactive');
      graphRef.current.setElementState(matchedIds, []); // clear state for matched
      
      const visibleNodeIds = new Set(matchedIds);
      const matchedEdges = edges.filter((e: any) => 
          visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
      );
      const unmatchedEdges = edges.filter((e: any) => !matchedEdges.includes(e));
      
      graphRef.current.setElementState(unmatchedEdges.map((e: any) => e.id), 'inactive');
      graphRef.current.setElementState(matchedEdges.map((e: any) => e.id), []);
  };

  return (
    <div className="graph-container" style={{ position: 'relative', height: '100%' }}>
      <GraphToolbar 
        onZoomIn={() => graphRef.current?.zoomBy(1.2)}
        onZoomOut={() => graphRef.current?.zoomBy(0.8)}
        onFitView={() => graphRef.current?.fitView()}
        layout={layout}
        onLayoutChange={onLayoutChange}
        onLayoutExecute={onLayoutExecute}
        onExport={onExport}
        onImport={onImport}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      
      <GraphSearch 
        nodes={data.nodes}
        onSelect={handleSearchSelect}
        onFilter={handleFilter}
      />
      
      <HelpOverlay />

      <div ref={containerRef} style={{ height: '600px', background: '#f5f5f5' }} />
      
      {contextMenuState.visible && (
        <div 
            style={{ 
                position: 'fixed', 
                left: contextMenuState.x, 
                top: contextMenuState.y,
                width: 1, height: 1, zIndex: 1000
            }}
        >
            <Dropdown 
                menu={{ items: menuItems }} 
                open={true} 
                trigger={['contextMenu']}
                onOpenChange={(open) => !open && setContextMenuState(prev => ({ ...prev, visible: false }))}
            >
                <span />
            </Dropdown>
        </div>
      )}
      
      {contextMenuState.visible && (
        <div 
            style={{ position: 'fixed', inset: 0, zIndex: 999 }} 
            onClick={() => setContextMenuState(prev => ({ ...prev, visible: false }))}
            onContextMenu={(e) => {
                e.preventDefault();
                setContextMenuState(prev => ({ ...prev, visible: false }));
            }}
        />
      )}

      {editingState.visible && (
          <div
            style={{
                position: 'fixed',
                left: editingState.x,
                top: editingState.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 1001
            }}
          >
              <Input 
                autoFocus
                value={editingState.value}
                onChange={(e) => setEditingState(prev => ({ ...prev, value: e.target.value }))}
                onBlur={() => {
                    if (editingState.type && editingState.id) {
                        onUpdateLabel(editingState.type, editingState.id, editingState.value);
                    }
                    setEditingState(prev => ({ ...prev, visible: false }));
                }}
                onPressEnter={(e) => {
                    e.currentTarget.blur();
                }}
                style={{ width: 120, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
              />
          </div>
      )}
    </div>
  );
});

export default GraphCanvas;
