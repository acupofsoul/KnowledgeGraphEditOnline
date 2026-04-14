import { PageContainer } from '@ant-design/pro-components';
import { Card, Button, Layout, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useModel } from '@umijs/max';
import GraphCanvas from '@/components/GraphCanvas';
import PropertyPanel from '@/components/PropertyPanel/index';

const { Sider, Content } = Layout;

const OntologyPage: React.FC = () => {
  const { 
    graphData, 
    addNode, 
    addEdge, 
    updateNode, 
    deleteItem, 
    selectedItem, 
    setSelectedItem, 
    updateEdge,
    updateNodePositions,
    importData,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo
  } = useModel('ontologyModel');

  const [layout, setLayout] = useState('dagre');
  // We need a ref to trigger layout execution in GraphCanvas
  const graphCanvasRef = useRef<any>(null);

  const handleAddNode = (x?: number, y?: number) => {
    addNode({
      style: { 
          labelText: 'New Class', 
          x: x !== undefined ? x : 300 + Math.random() * 50, 
          y: y !== undefined ? y : 300 + Math.random() * 50 
      },
    });
  };

  const getItemData = () => {
    if (!selectedItem) return undefined;
    const isNode = selectedItem.type === 'node';
    return isNode 
      ? graphData.nodes.find(n => n.id === selectedItem.id)
      : graphData.edges.find(e => e.id === selectedItem.id);
  };

  const handleUpdateLabel = (type: 'node' | 'edge', id: string, label: string) => {
      if (type === 'node') {
          const node = graphData.nodes.find(n => n.id === id);
          if (node) {
              updateNode(id, { style: { ...node.style, labelText: label } });
          }
      } else {
          const edge = graphData.edges.find(e => e.id === id);
          if (edge) {
              updateEdge(id, { style: { ...edge.style, labelText: label } });
          }
      }
  };

  const handleExport = () => {
      const dataStr = JSON.stringify(graphData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'knowledge-graph.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
  };

  const handleImport = (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              importData(json);
              message.success('Graph imported successfully');
          } catch (error) {
              message.error('Failed to import graph: Invalid JSON');
          }
      };
      reader.readAsText(file);
  };

  // Keyboard Shortcuts
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          // Delete
          if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItem) {
              // Check if we are focusing an input (don't delete node when editing text)
              const activeElement = document.activeElement;
              if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                  return;
              }
              deleteItem(selectedItem.type, selectedItem.id);
          }
          // Undo: Ctrl+Z
          if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
              e.preventDefault();
              handleUndo();
          }
          // Redo: Ctrl+Y or Ctrl+Shift+Z
          if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
              e.preventDefault();
              handleRedo();
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, handleUndo, handleRedo, deleteItem]);

  return (
    <PageContainer title="Ontology Editor" extra={<Button type="primary" onClick={handleAddNode}>Add Class</Button>}>
      <Card bodyStyle={{ padding: 0 }}>
        <Layout style={{ height: 600 }}>
            <Content style={{ borderRight: '1px solid #f0f0f0', position: 'relative' }}>
                <GraphCanvas 
                    ref={graphCanvasRef}
                    data={graphData}
                    onSelect={(type, id) => {
                        if (type && id) setSelectedItem({ type, id });
                        else setSelectedItem(null);
                    }}
                    onAddNode={(x, y) => handleAddNode(x, y)}
                    onAddEdge={(source, target) => {
                        addEdge({ source, target, style: { labelText: 'new_relation' } });
                    }}
                    onDelete={deleteItem}
                    onUpdatePositions={updateNodePositions}
                    onUpdateLabel={handleUpdateLabel}
                    // Toolbar props
                    layout={layout}
                    onLayoutChange={setLayout}
                    onLayoutExecute={() => {
                        // We need to expose a method in GraphCanvas to run layout
                        // This is handled via ref in GraphCanvas component, 
                        // but we actually implemented `executeLayout` inside GraphCanvas and passed it to Toolbar directly inside GraphCanvas.
                        // Wait, in GraphCanvas I passed `onLayoutExecute={executeLayout}`.
                        // So I don't need to pass it from here unless I want to control it from here.
                        // But `GraphCanvas` props definition expects `onLayoutExecute`? 
                        // Let's check GraphCanvas props. 
                        // Yes, `GraphCanvas` accepts `onLayoutExecute` prop but also implements `executeLayout` internally.
                        // Actually, I should pass a dummy or implement layout logic here if I want centralized control.
                        // But `GraphCanvas` has the graph instance.
                        // Let's look at `GraphCanvas.tsx`:
                        // It defines `executeLayout` internally and passes it to Toolbar.
                        // BUT it also accepts `onLayoutExecute` from props?
                        // Ah, in my previous `GraphCanvas` write, I defined `onLayoutExecute` in interface but didn't use it in the component body,
                        // instead I defined `executeLayout` locally and passed THAT to Toolbar.
                        // So the prop `onLayoutExecute` is unused. I should clean this up or ignore it.
                        // I will pass a no-op here.
                    }} 
                    onExport={handleExport}
                    onImport={handleImport}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />
            </Content>
            <Sider width={320} theme="light" style={{ background: '#fff' }}>
                <PropertyPanel 
                    selectedItem={selectedItem}
                    itemData={getItemData()}
                    onUpdate={(id, data) => {
                        if (selectedItem?.type === 'node') {
                            updateNode(id, data);
                        } else {
                            updateEdge(id, data);
                        }
                    }}
                />
            </Sider>
        </Layout>
      </Card>
    </PageContainer>
  );
};

export default OntologyPage;
