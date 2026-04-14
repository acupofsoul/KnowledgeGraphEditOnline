import { useState, useCallback } from 'react';
import { IGraphData, IGraphNode, IGraphEdge } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

export default () => {
  const [history, setHistory] = useState<IGraphData[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  const [graphData, setGraphDataState] = useState<IGraphData>({
    nodes: [
      { id: 'Person', style: { labelText: 'Person', x: 100, y: 100 } },
      { id: 'Organization', style: { labelText: 'Organization', x: 300, y: 100 } },
      { id: 'Location', style: { labelText: 'Location', x: 200, y: 200 } },
    ],
    edges: [
      { source: 'Person', target: 'Organization', style: { labelText: 'works_at' } },
      { source: 'Person', target: 'Location', style: { labelText: 'lives_in' } },
    ],
  });

  const [selectedItem, setSelectedItem] = useState<{ type: 'node' | 'edge'; id: string } | null>(null);

  // Wrapper for setGraphData to handle history
  const setGraphData = useCallback((newDataOrUpdater: IGraphData | ((prev: IGraphData) => IGraphData)) => {
      setGraphDataState((prev) => {
          const newData = typeof newDataOrUpdater === 'function' ? newDataOrUpdater(prev) : newDataOrUpdater;
          
          // Add to history
          // If we are in the middle of history, discard future
          const newHistory = history.slice(0, currentHistoryIndex + 1);
          newHistory.push(prev); // Save PREVIOUS state
          // Limit history size if needed (e.g., 50)
          if (newHistory.length > 50) newHistory.shift();
          
          setHistory(newHistory);
          setCurrentHistoryIndex(newHistory.length); // Point to the "next" slot effectively (or just length)
          // Actually, let's simplify: History stores snapshots. Current state is not in history array usually, or is the last one.
          // Standard: History = [State 0, State 1, ...]. Current Index points to current state.
          // My implementation above: History stores *past* states.
          // Let's refine:
          
          return newData;
      });
  }, [history, currentHistoryIndex]);

  // A better history implementation
  // We need to sync `graphData` update with history update.
  // Since `setGraphDataState` is async, we can't easily grab "current" for history inside it unless we use refs or careful effect.
  // But we can just use a specific function `pushHistory`.
  
  const pushHistory = (state: IGraphData) => {
      const newHistory = history.slice(0, currentHistoryIndex + 1);
      newHistory.push(state);
      setHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);
  };

  const updateGraphData = (updater: (prev: IGraphData) => IGraphData) => {
      setGraphDataState(prev => {
          const newData = updater(prev);
          // Only push history if data actually changed
          if (!_.isEqual(prev, newData)) {
              pushHistory(prev); // Save the state BEFORE change
          }
          return newData;
      });
  };

  const undo = () => {
      if (currentHistoryIndex >= 0) {
          const prevState = history[currentHistoryIndex];
          // We need to save CURRENT state to "future" if we want Redo?
          // Standard Undo/Redo:
          // History: [S1, S2, S3]
          // Pointer: 2 (S3)
          // Undo -> Pointer: 1 (S2)
          // Redo -> Pointer: 2 (S3)
          // New Change -> Remove S3+, Add S4, Pointer 2
          
          // My simplified logic above was saving "past" states.
          // Let's fix it.
          // Actually, let's assume `graphData` IS the current state.
          // We need a separate `history` array that includes ALL states including current?
          // Or just use a library? No, let's implement simple one.
          
          // Let's revert to:
          // pushHistory(currentGraphData);
          // setGraphData(prevState);
          
          // It's getting complicated with just state.
          // Let's keep it simple: 
          // `history` stack, `future` stack.
      }
  };

  // --- Re-implementing Undo/Redo with Past/Future stacks ---
  const [past, setPast] = useState<IGraphData[]>([]);
  const [future, setFuture] = useState<IGraphData[]>([]);

  const updateGraph = (updater: (prev: IGraphData) => IGraphData) => {
      setGraphDataState(prev => {
          const newData = updater(prev);
          if (!_.isEqual(prev, newData)) {
              setPast(p => [...p, prev]);
              setFuture([]); // Clear future on new change
          }
          return newData;
      });
  };

  const handleUndo = () => {
      if (past.length === 0) return;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      
      setFuture(f => [graphData, ...f]);
      setGraphDataState(previous);
      setPast(newPast);
  };

  const handleRedo = () => {
      if (future.length === 0) return;
      const next = future[0];
      const newFuture = future.slice(1);
      
      setPast(p => [...p, graphData]);
      setGraphDataState(next);
      setFuture(newFuture);
  };

  // --- CRUD Operations using `updateGraph` ---

  const addNode = useCallback((node: Partial<IGraphNode>) => {
    let newNode: IGraphNode;
    updateGraph((prev) => {
        newNode = {
            id: node.id || uuidv4(),
            style: { 
                labelText: 'New Node', 
                x: node.style?.x ?? 100, 
                y: node.style?.y ?? 100, 
                ...node.style 
            },
            ...node,
        };
        return {
            ...prev,
            nodes: [...prev.nodes, newNode],
        };
    });
    return newNode!;
  }, []);

  const addEdge = useCallback((edge: Partial<IGraphEdge> & { source: string; target: string }) => {
    let newEdge: IGraphEdge;
    updateGraph((prev) => {
        newEdge = {
            id: edge.id || uuidv4(),
            style: { labelText: 'New Relation', ...edge.style },
            ...edge,
        };
        return {
            ...prev,
            edges: [...prev.edges, newEdge],
        };
    });
    return newEdge!;
  }, []);

  const updateNode = useCallback((id: string, data: Partial<IGraphNode>) => {
    updateGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? _.merge({}, n, data) : n)),
    }));
  }, []);

  const updateEdge = useCallback((id: string, data: Partial<IGraphEdge>) => {
    updateGraph((prev) => ({
      ...prev,
      edges: prev.edges.map((e) => {
        if (id && e.id === id) return _.merge({}, e, data);
        return e;
      }),
    }));
  }, []);

  const deleteItem = useCallback((type: 'node' | 'edge', id: string) => {
    updateGraph((prev) => {
      if (type === 'node') {
        return {
          nodes: prev.nodes.filter((n) => n.id !== id),
          edges: prev.edges.filter((e) => e.source !== id && e.target !== id),
        };
      } else {
        return {
          ...prev,
          edges: prev.edges.filter((e) => e.id !== id),
        };
      }
    });
    setSelectedItem(null);
  }, []);

  const updateNodePositions = useCallback((positions: Record<string, { x: number; y: number }>) => {
      updateGraph(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => {
              if (positions[n.id]) {
                  return {
                      ...n,
                      style: {
                          ...n.style,
                          x: positions[n.id].x,
                          y: positions[n.id].y
                      }
                  };
              }
              return n;
          })
      }));
  }, []);

  // Import
  const importData = useCallback((data: IGraphData) => {
      // Validate data structure lightly
      if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
          updateGraph(() => data);
      } else {
          console.error("Invalid data format");
      }
  }, []);

  return {
    graphData,
    selectedItem,
    setSelectedItem,
    addNode,
    addEdge,
    updateNode,
    updateEdge,
    deleteItem,
    updateNodePositions,
    importData,
    handleUndo,
    handleRedo,
    canUndo: past.length > 0,
    canRedo: future.length > 0
  };
};
