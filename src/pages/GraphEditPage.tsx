import React, { useState, useCallback } from 'react';
import { Layout, Button, Drawer, Form, Input, Select, message } from 'antd';
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Node, 
  Edge
} from 'react-flow-renderer';
import 'react-flow-renderer/dist/style.css';
import { useGraphStore } from '../store/useGraphStore';
import { Node as GraphNode, Relationship } from '../utils/types';

const { Content } = Layout;
const { Option } = Select;

const GraphEditPage: React.FC = () => {
  const [form] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingElement, setEditingElement] = useState<GraphNode | Relationship | null>(null);
  
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
  }, [setSelectedElement]);

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

  // 处理添加节点
  const handleAddNode = (conceptId: string) => {
    addNode({
      conceptId,
      properties: {},
      position: { x: 100, y: 100 }
    });
    message.success('节点添加成功');
  };

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
      
      <div className="h-[80vh] border rounded-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          fitView
        >
          <Controls />
          <Background color="#f0f0f0" gap={16} />
        </ReactFlow>
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
        <Form form={form} layout="vertical">
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
                  rules={prop.required ? [{ required: true, message: `请输入${prop.name}` }] : []}
                >
                  <Input placeholder={prop.defaultValue || ''} />
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
                  rules={prop.required ? [{ required: true, message: `请输入${prop.name}` }] : []}
                >
                  <Input placeholder={prop.defaultValue || ''} />
                </Form.Item>
              ))
          )}
        </Form>
      </Drawer>
    </Content>
  );
};

export default GraphEditPage;
