import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Tabs, Divider } from 'antd';
import { useGraphStore } from '../../stores/graphStore';
import { useUIStore } from '../../stores/uiStore';
import { useOntologyStore } from '../../stores/ontologyStore';
import './index.less';

const { Option } = Select;
const { TabPane } = Tabs;

const SidePanel: React.FC = () => {
  const [form] = Form.useForm();
  
  // 状态管理
  const { nodes, edges, updateNode, updateEdge } = useGraphStore();
  const { selection, config, toggleSidePanel } = useUIStore();
  const { ontology } = useOntologyStore();
  
  // 获取选中的节点或边
  const selectedNode = selection.selectedNodes.length === 1 
    ? nodes.find((node) => node.id === selection.selectedNodes[0])
    : null;
  
  const selectedEdge = selection.selectedEdges.length === 1
    ? edges.find((edge) => edge.id === selection.selectedEdges[0])
    : null;
  
  // 当选中对象变化时，重置表单
  useEffect(() => {
    if (selectedNode) {
      form.setFieldsValue({
        label: selectedNode.label,
        type: selectedNode.type,
        properties: selectedNode.properties,
      });
    } else if (selectedEdge) {
      form.setFieldsValue({
        label: selectedEdge.label,
        type: selectedEdge.type,
        properties: selectedEdge.properties,
      });
    } else {
      form.resetFields();
    }
  }, [selectedNode, selectedEdge, form]);
  
  // 处理表单提交
  const handleSubmit = (values: any) => {
    if (selectedNode) {
      updateNode(selectedNode.id, {
        label: values.label,
        type: values.type,
        properties: values.properties || {},
      });
    } else if (selectedEdge) {
      updateEdge(selectedEdge.id, {
        label: values.label,
        type: values.type,
        properties: values.properties || {},
      });
    }
  };
  
  // 处理表单值变化
  const handleValuesChange = (changedValues: any) => {
    if (selectedNode) {
      // 如果类型变化，重置属性
      if (changedValues.type) {
        form.setFieldsValue({ properties: {} });
      }
      updateNode(selectedNode.id, changedValues);
    } else if (selectedEdge) {
      // 如果类型变化，重置属性
      if (changedValues.type) {
        form.setFieldsValue({ properties: {} });
      }
      updateEdge(selectedEdge.id, changedValues);
    }
  };
  
  // 渲染节点属性表单
  const renderNodeForm = () => {
    if (!selectedNode) return null;
    
    // 获取当前选中的节点类型
    const currentType = form.getFieldValue('type') || selectedNode.type;
    
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          name="label"
          label="节点标签"
          rules={[{ required: true, message: '请输入节点标签' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          name="type"
          label="节点类型"
          rules={[{ required: true, message: '请选择节点类型' }]}
        >
          <Select>
            {ontology.nodeTypes.map((type) => (
              <Option key={type.id} value={type.id}>
                {type.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item label="属性">
          <div className="properties-container">
            {ontology.nodeTypes
              .find((type) => type.id === currentType)
              ?.properties.map((property) => (
                <Form.Item
                  key={property.id}
                  name={['properties', property.name]}
                  label={property.name}
                  rules={property.required ? [{ required: true, message: `请输入${property.name}` }] : []}
                >
                  <Input placeholder={property.description} />
                </Form.Item>
              ))}
          </div>
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form.Item>
      </Form>
    );
  };
  
  // 渲染边属性表单
  const renderEdgeForm = () => {
    if (!selectedEdge) return null;
    
    // 获取当前选中的边类型
    const currentType = form.getFieldValue('type') || selectedEdge.type;
    
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          name="label"
          label="边标签"
          rules={[{ required: true, message: '请输入边标签' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          name="type"
          label="边类型"
          rules={[{ required: true, message: '请选择边类型' }]}
        >
          <Select>
            {ontology.edgeTypes.map((type) => (
              <Option key={type.id} value={type.id}>
                {type.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item label="属性">
          <div className="properties-container">
            {ontology.edgeTypes
              .find((type) => type.id === currentType)
              ?.properties.map((property) => (
                <Form.Item
                  key={property.id}
                  name={['properties', property.name]}
                  label={property.name}
                  rules={property.required ? [{ required: true, message: `请输入${property.name}` }] : []}
                >
                  <Input placeholder={property.description} />
                </Form.Item>
              ))}
          </div>
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form.Item>
      </Form>
    );
  };
  
  // 渲染本体信息
  const renderOntologyInfo = () => {
    return (
      <div className="ontology-info">
        <h3>本体信息</h3>
        <Divider />
        
        <div className="ontology-section">
          <h4>节点类型</h4>
          <ul>
            {ontology.nodeTypes.map((type) => (
              <li key={type.id}>
                <span className="type-name">{type.name}</span>
                <span 
                  className="type-color" 
                  style={{ backgroundColor: type.color }}
                />
              </li>
            ))}
          </ul>
        </div>
        
        <Divider />
        
        <div className="ontology-section">
          <h4>边类型</h4>
          <ul>
            {ontology.edgeTypes.map((type) => (
              <li key={type.id}>
                <span className="type-name">{type.name}</span>
                <span 
                  className="type-color" 
                  style={{ backgroundColor: type.color }}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };
  
  // 渲染空状态
  const renderEmptyState = () => {
    return (
      <div className="empty-state">
        <p>请选择一个节点或边以编辑其属性</p>
      </div>
    );
  };
  
  return (
    <div 
      className="side-panel"
      style={{ width: config.view.sidePanel.width }}
    >
      <div className="side-panel-header">
        <h2>属性面板</h2>
        <Button 
          type="text" 
          icon={<span>×</span>}
          onClick={() => toggleSidePanel(false)}
          className="close-button"
        />
      </div>
      
      <div className="side-panel-content">
        <Tabs defaultActiveKey="properties">
          <TabPane tab="属性" key="properties">
            {selection.selectedNodes.length === 1 && renderNodeForm()}
            {selection.selectedEdges.length === 1 && renderEdgeForm()}
            {selection.selectedNodes.length === 0 && selection.selectedEdges.length === 0 && renderEmptyState()}
          </TabPane>
          <TabPane tab="本体" key="ontology">
            {renderOntologyInfo()}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default SidePanel;
