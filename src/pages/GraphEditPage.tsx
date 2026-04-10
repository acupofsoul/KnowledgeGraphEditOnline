import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Layout, Button, Drawer, Form, Input, Select, message, Menu, Dropdown } from 'antd';
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Node, 
  Edge,
  useReactFlow,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraphStore } from '../store/useGraphStore';
import { Node as GraphNode, Relationship } from '../utils/types';

const { Content } = Layout;
const { Option } = Select;

const GraphEditPage: React.FC = () => {
  const [form] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingElement, setEditingElement] = useState<GraphNode | Relationship | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; element: 'node' | 'edge' | 'pane'; id: string | null } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { getViewport } = useReactFlow();
  
  const {
    graph,
    addNode,
    updateNode,
    deleteNode,
    addRelationship,
    updateRelationship,
    deleteRelationship,
    selectedElement,
    setSelectedElement
  } = useGraphStore();

  // 转换为React Flow格式的节点和边
  const reactFlowNodes = graph.nodes.map((node): Node => {
    const concept = graph.concepts.find(c => c.id === node.conceptId);
    return {
      id: node.id,
      type: 'default',
      data: {
        label: `${concept?.name || 'Node'}\n${Object.entries(node.properties).map(([key, value]) => `${key}: ${value}`).join('\n')}`,
        node
      },
      position: node.position,
      selected: selectedElement === node.id
    };
  });

  const reactFlowEdges = graph.relationships.map((rel): Edge => {
    const relationshipType = graph.relationshipTypes.find(r => r.id === rel.relationshipTypeId);
    return {
      id: rel.id,
      source: rel.source,
      target: rel.target,
      label: relationshipType?.name || 'Relationship',
      selected: selectedElement === rel.id
    };
  });

  // React Flow状态管理
  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  // 处理边的创建
  const onConnect = useCallback((params: any) => {
    const newEdge = addEdge(params, edges);
    const relationshipType = graph.relationshipTypes[0]; // 默认使用第一个关系类型
    
    if (relationshipType) {
      addRelationship({
        source: params.source,
        target: params.target,
        relationshipTypeId: relationshipType.id,
        properties: {}
      });
      setEdges(newEdge);
    } else {
      message.error('请先创建关系类型');
    }
  }, [edges, graph.relationshipTypes, addRelationship, setEdges]);

  // 处理节点选择
  const onNodeClick = useCallback((event: any, node: Node) => {
    event.stopPropagation();
    setSelectedElement(node.id);
    const graphNode = graph.nodes.find(n => n.id === node.id);
    if (graphNode) {
      setEditingElement(graphNode);
      form.setFieldsValue(graphNode.properties);
      setDrawerVisible(true);
    }
  }, [graph.nodes, setSelectedElement, form]);

  // 处理边选择
  const onEdgeClick = useCallback((event: any, edge: Edge) => {
    event.stopPropagation();
    setSelectedElement(edge.id);
    const relationship = graph.relationships.find(r => r.id === edge.id);
    if (relationship) {
      setEditingElement(relationship);
      form.setFieldsValue(relationship.properties);
      setDrawerVisible(true);
    }
  }, [graph.relationships, setSelectedElement, form]);

  // 处理画布点击（取消选择）
  const onPaneClick = useCallback(() => {
    setSelectedElement(null);
    setDrawerVisible(false);
    setContextMenu(null);
  }, [setSelectedElement]);

  // 处理右键菜单
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      element: 'node',
      id: node.id
    });
  }, []);

  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      element: 'edge',
      id: edge.id
    });
  }, []);

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      element: 'pane',
      id: null
    });
  }, []);

  // 处理键盘操作
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedElement) {
        if (event.key === 'Delete' || event.key === 'Backspace') {
          if (graph.nodes.some(node => node.id === selectedElement)) {
            deleteNode(selectedElement);
            message.success('节点删除成功');
          } else if (graph.relationships.some(rel => rel.id === selectedElement)) {
            deleteRelationship(selectedElement);
            message.success('关系删除成功');
          }
          setSelectedElement(null);
          setDrawerVisible(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, graph.nodes, graph.relationships, deleteNode, deleteRelationship, setSelectedElement]);

  // 处理属性编辑
  const handlePropertyEdit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingElement && 'conceptId' in editingElement) {
        // 编辑节点
        updateNode(editingElement.id, {
          properties: values
        });
        message.success('节点属性更新成功');
      } else if (editingElement && 'source' in editingElement) {
        // 编辑关系
        updateRelationship(editingElement.id, {
          properties: values
        });
        message.success('关系属性更新成功');
      }
      
      setDrawerVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  // 处理删除元素
  const handleDeleteElement = () => {
    if (editingElement && 'conceptId' in editingElement) {
      deleteNode(editingElement.id);
      message.success('节点删除成功');
    } else if (editingElement && 'source' in editingElement) {
      deleteRelationship(editingElement.id);
      message.success('关系删除成功');
    }
    setDrawerVisible(false);
    setSelectedElement(null);
  };

  // 处理从右键菜单删除
  const handleContextMenuDelete = () => {
    if (contextMenu?.id) {
      if (contextMenu.element === 'node') {
        deleteNode(contextMenu.id);
        message.success('节点删除成功');
      } else if (contextMenu.element === 'edge') {
        deleteRelationship(contextMenu.id);
        message.success('关系删除成功');
      }
      setContextMenu(null);
      setSelectedElement(null);
    }
  };

  // 处理添加节点
  const handleAddNode = (conceptId: string) => {
    const viewport = getViewport();
    addNode({
      conceptId,
      properties: {},
      position: { x: viewport.x + 100, y: viewport.y + 100 }
    });
    message.success('节点添加成功');
  };

  // 右键菜单配置
  const contextMenuItems = [
    contextMenu?.element === 'node' && {
      key: 'delete',
      label: '删除节点',
      onClick: handleContextMenuDelete
    },
    contextMenu?.element === 'edge' && {
      key: 'delete',
      label: '删除关系',
      onClick: handleContextMenuDelete
    },
    ...(contextMenu?.element === 'pane' ? graph.concepts.map(concept => ({
      key: concept.id,
      label: `添加 ${concept.name}`,
      onClick: () => {
        handleAddNode(concept.id);
        setContextMenu(null);
      }
    })) : [])
  ].filter(Boolean);

  return (
    <Content className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">图谱编辑</h2>
        <div className="flex gap-2">
          {graph.concepts.map(concept => (
            <Button 
              key={concept.id} 
              onClick={() => handleAddNode(concept.id)}
            >
              添加 {concept.name}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="h-[80vh] border rounded-lg" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          fitView
          minZoom={0.1}
          maxZoom={4}
        >
          <Controls />
          <Background color="#f0f0f0" gap={16} />
        </ReactFlow>
        
        {/* 右键菜单 */}
        {contextMenu && (
          <div
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              zIndex: 1000,
              backgroundColor: 'white',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          >
            <Menu items={contextMenuItems} />
          </div>
        )}
      </div>

      <Drawer
        title={editingElement && 'conceptId' in editingElement ? '编辑节点属性' : '编辑关系属性'}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={400}
        footer={[
          <Button key="delete" danger onClick={handleDeleteElement}>
            删除
          </Button>,
          <Button key="cancel" onClick={() => setDrawerVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handlePropertyEdit}>
            确定
          </Button>
        ]}
      >
        <Form form={form} layout="vertical" className="space-y-4">
          {editingElement && 'conceptId' in editingElement && (
            <Form.Item label="节点类型">
              <Select value={editingElement.conceptId} disabled>
                {graph.concepts.map(concept => (
                  <Option key={concept.id} value={concept.id}>{concept.name}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
          {editingElement && 'source' in editingElement && (
            <Form.Item label="关系类型">
              <Select value={editingElement.relationshipTypeId} disabled>
                {graph.relationshipTypes.map(type => (
                  <Option key={type.id} value={type.id}>{type.name}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
          
          {/* 动态生成属性表单 */}
          {editingElement && 'conceptId' in editingElement && (
            graph.concepts
              .find(c => c.id === editingElement.conceptId)
              ?.properties.map(prop => (
                <Form.Item
                  key={prop.id}
                  name={prop.name}
                  label={prop.name}
                  rules={[
                    ...(prop.required ? [{ required: true, message: `请输入${prop.name}` }] : [])
                  ]}
                >
                  {prop.type === 'string' && (
                    <Input placeholder={prop.defaultValue || ''} />
                  )}
                  {prop.type === 'number' && (
                    <Input type="number" placeholder={prop.defaultValue || ''} />
                  )}
                  {prop.type === 'boolean' && (
                    <Select placeholder={prop.defaultValue || ''}>
                      <Option value={true}>是</Option>
                      <Option value={false}>否</Option>
                    </Select>
                  )}
                  {prop.type === 'date' && (
                    <Input type="date" placeholder={prop.defaultValue || ''} />
                  )}
                </Form.Item>
              ))
          )}
          {editingElement && 'source' in editingElement && (
            graph.relationshipTypes
              .find(r => r.id === editingElement.relationshipTypeId)
              ?.properties.map(prop => (
                <Form.Item
                  key={prop.id}
                  name={prop.name}
                  label={prop.name}
                  rules={[
                    ...(prop.required ? [{ required: true, message: `请输入${prop.name}` }] : [])
                  ]}
                >
                  {prop.type === 'string' && (
                    <Input placeholder={prop.defaultValue || ''} />
                  )}
                  {prop.type === 'number' && (
                    <Input type="number" placeholder={prop.defaultValue || ''} />
                  )}
                  {prop.type === 'boolean' && (
                    <Select placeholder={prop.defaultValue || ''}>
                      <Option value={true}>是</Option>
                      <Option value={false}>否</Option>
                    </Select>
                  )}
                  {prop.type === 'date' && (
                    <Input type="date" placeholder={prop.defaultValue || ''} />
                  )}
                </Form.Item>
              ))
          )}
          {((!editingElement) || 
            (!('conceptId' in editingElement && graph.concepts.find(c => c.id === editingElement.conceptId)?.properties.length) && 
             !('source' in editingElement && graph.relationshipTypes.find(r => r.id === editingElement.relationshipTypeId)?.properties.length))) && (
            <div className="text-center text-gray-500 py-8">
              该元素没有可编辑的属性
            </div>
          )}
        </Form>
      </Drawer>
    </Content>
  );
};

export default GraphEditPage;
