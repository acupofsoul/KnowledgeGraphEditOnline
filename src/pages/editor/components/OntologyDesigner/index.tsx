import React, { useState } from 'react';
import { Modal, Tabs, Form, Input, Select, Button, Table, Popconfirm, message, Collapse, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useOntologyStore } from '../../stores/ontologyStore';
import { useUIStore } from '../../stores/uiStore';
import { NodeType, EdgeType, TypeGroup, Property } from '../../types';
import './index.less';

const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const OntologyDesigner: React.FC = () => {
  const { ontology, addNodeType, addEdgeType, addTypeGroup, updateNodeType, updateEdgeType, updateTypeGroup, deleteNodeType, deleteEdgeType, deleteTypeGroup } = useOntologyStore();
  const { ontologyDesigner, toggleOntologyDesigner, setOntologyDesignerTab } = useUIStore();
  
  // 表单状态
  const [nodeTypeForm] = Form.useForm();
  const [edgeTypeForm] = Form.useForm();
  const [typeGroupForm] = Form.useForm();
  
  // 编辑状态
  const [editingNodeType, setEditingNodeType] = useState<NodeType | null>(null);
  const [editingEdgeType, setEditingEdgeType] = useState<EdgeType | null>(null);
  const [editingTypeGroup, setEditingTypeGroup] = useState<TypeGroup | null>(null);
  
  // 属性管理状态
  const [nodeTypeProperties, setNodeTypeProperties] = useState<Property[]>([]);
  const [edgeTypeProperties, setEdgeTypeProperties] = useState<Property[]>([]);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyForm] = Form.useForm();
  
  // 处理节点类型提交
  const handleNodeTypeSubmit = (values: any) => {
    if (editingNodeType) {
      updateNodeType(editingNodeType.id, {
        ...values,
        properties: nodeTypeProperties,
        constraints: values.constraints || [],
      });
      message.success('节点类型更新成功');
    } else {
      addNodeType({
        ...values,
        properties: nodeTypeProperties,
        constraints: values.constraints || [],
      });
      message.success('节点类型创建成功');
    }
    nodeTypeForm.resetFields();
    setEditingNodeType(null);
    setNodeTypeProperties([]);
  };
  
  // 处理边类型提交
  const handleEdgeTypeSubmit = (values: any) => {
    if (editingEdgeType) {
      updateEdgeType(editingEdgeType.id, {
        ...values,
        properties: edgeTypeProperties,
        constraints: values.constraints || [],
        sourceTypes: values.sourceTypes || [],
        targetTypes: values.targetTypes || [],
      });
      message.success('边类型更新成功');
    } else {
      addEdgeType({
        ...values,
        properties: edgeTypeProperties,
        constraints: values.constraints || [],
        sourceTypes: values.sourceTypes || [],
        targetTypes: values.targetTypes || [],
      });
      message.success('边类型创建成功');
    }
    edgeTypeForm.resetFields();
    setEditingEdgeType(null);
    setEdgeTypeProperties([]);
  };
  
  // 处理编辑节点类型
  const handleEditNodeType = (nodeType: NodeType) => {
    setEditingNodeType(nodeType);
    nodeTypeForm.setFieldsValue(nodeType);
    setNodeTypeProperties(nodeType.properties || []);
  };
  
  // 处理编辑边类型
  const handleEditEdgeType = (edgeType: EdgeType) => {
    setEditingEdgeType(edgeType);
    edgeTypeForm.setFieldsValue(edgeType);
    setEdgeTypeProperties(edgeType.properties || []);
  };
  
  // 处理添加属性
  const handleAddProperty = () => {
    propertyForm.resetFields();
    setEditingProperty(null);
  };
  
  // 处理编辑属性
  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    propertyForm.setFieldsValue(property);
  };
  
  // 处理删除属性
  const handleDeleteProperty = (propertyId: string, isNodeType: boolean) => {
    if (isNodeType) {
      setNodeTypeProperties(nodeTypeProperties.filter(p => p.id !== propertyId));
    } else {
      setEdgeTypeProperties(edgeTypeProperties.filter(p => p.id !== propertyId));
    }
  };
  
  // 处理属性提交
  const handlePropertySubmit = (values: any, isNodeType: boolean) => {
    const newProperty: Property = {
      id: editingProperty ? editingProperty.id : `property-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...values,
    };
    
    if (isNodeType) {
      if (editingProperty) {
        setNodeTypeProperties(nodeTypeProperties.map(p => p.id === editingProperty.id ? newProperty : p));
      } else {
        setNodeTypeProperties([...nodeTypeProperties, newProperty]);
      }
    } else {
      if (editingProperty) {
        setEdgeTypeProperties(edgeTypeProperties.map(p => p.id === editingProperty.id ? newProperty : p));
      } else {
        setEdgeTypeProperties([...edgeTypeProperties, newProperty]);
      }
    }
    
    propertyForm.resetFields();
    setEditingProperty(null);
  };
  
  // 处理类型组提交
  const handleTypeGroupSubmit = (values: any) => {
    if (editingTypeGroup) {
      updateTypeGroup(editingTypeGroup.id, values);
      message.success('类型组更新成功');
    } else {
      addTypeGroup({
        ...values,
        nodeTypeIds: values.nodeTypeIds || [],
        edgeTypeIds: values.edgeTypeIds || [],
      });
      message.success('类型组创建成功');
    }
    typeGroupForm.resetFields();
    setEditingTypeGroup(null);
  };
  
  // 处理编辑类型组
  const handleEditTypeGroup = (typeGroup: TypeGroup) => {
    setEditingTypeGroup(typeGroup);
    typeGroupForm.setFieldsValue(typeGroup);
  };
  
  // 处理删除节点类型
  const handleDeleteNodeType = (id: string) => {
    deleteNodeType(id);
    message.success('节点类型删除成功');
  };
  
  // 处理删除边类型
  const handleDeleteEdgeType = (id: string) => {
    deleteEdgeType(id);
    message.success('边类型删除成功');
  };
  
  // 处理删除类型组
  const handleDeleteTypeGroup = (id: string) => {
    deleteTypeGroup(id);
    message.success('类型组删除成功');
  };
  
  // 节点类型列
  const nodeTypeColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <div style={{ width: 20, height: 20, backgroundColor: color, borderRadius: 4 }} />
      ),
    },
    {
      title: '形状',
      dataIndex: 'shape',
      key: 'shape',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: NodeType) => (
        <div>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditNodeType(record)}
          />
          <Popconfirm
            title="确定要删除这个节点类型吗？"
            onConfirm={() => handleDeleteNodeType(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];
  
  // 边类型列
  const edgeTypeColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <div style={{ width: 20, height: 20, backgroundColor: color, borderRadius: 4 }} />
      ),
    },
    {
      title: '线型',
      dataIndex: 'lineStyle',
      key: 'lineStyle',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: EdgeType) => (
        <div>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditEdgeType(record)}
          />
          <Popconfirm
            title="确定要删除这个边类型吗？"
            onConfirm={() => handleDeleteEdgeType(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];
  
  // 类型组列
  const typeGroupColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '节点类型数量',
      key: 'nodeTypeCount',
      render: (_: any, record: TypeGroup) => record.nodeTypeIds.length,
    },
    {
      title: '边类型数量',
      key: 'edgeTypeCount',
      render: (_: any, record: TypeGroup) => record.edgeTypeIds.length,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: TypeGroup) => (
        <div>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditTypeGroup(record)}
          />
          <Popconfirm
            title="确定要删除这个类型组吗？"
            onConfirm={() => handleDeleteTypeGroup(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];
  
  return (
    <Modal
      title="本体设计器"
      open={ontologyDesigner.visible}
      onCancel={() => toggleOntologyDesigner(false)}
      width={800}
      footer={null}
    >
      <Tabs 
        activeKey={ontologyDesigner.activeTab}
        onChange={(key) => setOntologyDesignerTab(key as "nodeTypes" | "edgeTypes" | "typeGroups")}
      >
        {/* 节点类型 */}
        <TabPane tab="节点类型" key="nodeTypes">
          <div className="ontology-designer-header">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingNodeType(null);
                nodeTypeForm.resetFields();
              }}
            >
              添加节点类型
            </Button>
          </div>
          
          <Form
            form={nodeTypeForm}
            layout="vertical"
            onFinish={handleNodeTypeSubmit}
            className="ontology-designer-form"
          >
            <Form.Item
              name="name"
              label="名称"
              rules={[{ required: true, message: '请输入节点类型名称' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="描述"
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            
            <Form.Item
              name="color"
              label="颜色"
              initialValue="#1890ff"
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="shape"
              label="形状"
              initialValue="rect"
            >
              <Select>
                <Option value="rect">矩形</Option>
                <Option value="circle">圆形</Option>
                <Option value="ellipse">椭圆</Option>
                <Option value="diamond">菱形</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="defaultSize"
              label="默认大小"
              initialValue={40}
            >
              <Input type="number" />
            </Form.Item>
            
            <Collapse>
              <Panel header="属性管理" key="properties">
                <div className="property-management">
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleAddProperty}
                    style={{ marginBottom: 16 }}
                  >
                    添加属性
                  </Button>
                  
                  <Table 
                    columns={[
                      {
                        title: '名称',
                        dataIndex: 'name',
                        key: 'name',
                      },
                      {
                        title: '类型',
                        dataIndex: 'type',
                        key: 'type',
                      },
                      {
                        title: '是否必填',
                        dataIndex: 'required',
                        key: 'required',
                        render: (required: boolean) => required ? '是' : '否',
                      },
                      {
                        title: '操作',
                        key: 'action',
                        render: (_: any, record: Property) => (
                          <div>
                            <Button 
                              type="text" 
                              icon={<EditOutlined />} 
                              onClick={() => handleEditProperty(record)}
                            />
                            <Popconfirm
                              title="确定要删除这个属性吗？"
                              onConfirm={() => handleDeleteProperty(record.id, true)}
                              okText="确定"
                              cancelText="取消"
                            >
                              <Button type="text" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                          </div>
                        ),
                      },
                    ]} 
                    dataSource={nodeTypeProperties} 
                    rowKey="id"
                    style={{ marginBottom: 16 }}
                  />
                  
                  <Form
                    form={propertyForm}
                    layout="vertical"
                    onFinish={(values) => handlePropertySubmit(values, true)}
                    className="property-form"
                  >
                    <Form.Item
                      name="name"
                      label="属性名称"
                      rules={[{ required: true, message: '请输入属性名称' }]}
                    >
                      <Input />
                    </Form.Item>
                    
                    <Form.Item
                      name="type"
                      label="属性类型"
                      initialValue="string"
                      rules={[{ required: true, message: '请选择属性类型' }]}
                    >
                      <Select>
                        <Option value="string">字符串</Option>
                        <Option value="number">数字</Option>
                        <Option value="boolean">布尔值</Option>
                        <Option value="date">日期</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      name="description"
                      label="描述"
                    >
                      <Input.TextArea rows={2} />
                    </Form.Item>
                    
                    <Form.Item
                      name="required"
                      label="是否必填"
                      valuePropName="checked"
                    >
                      <Checkbox />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        {editingProperty ? '更新属性' : '添加属性'}
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </Panel>
            </Collapse>
            
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editingNodeType ? '更新' : '创建'}
              </Button>
            </Form.Item>
          </Form>
          
          <Table 
            columns={nodeTypeColumns} 
            dataSource={ontology.nodeTypes} 
            rowKey="id"
            className="ontology-designer-table"
          />
        </TabPane>
        
        {/* 边类型 */}
        <TabPane tab="边类型" key="edgeTypes">
          <div className="ontology-designer-header">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingEdgeType(null);
                edgeTypeForm.resetFields();
              }}
            >
              添加边类型
            </Button>
          </div>
          
          <Form
            form={edgeTypeForm}
            layout="vertical"
            onFinish={handleEdgeTypeSubmit}
            className="ontology-designer-form"
          >
            <Form.Item
              name="name"
              label="名称"
              rules={[{ required: true, message: '请输入边类型名称' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="描述"
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            
            <Form.Item
              name="color"
              label="颜色"
              initialValue="#faad14"
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="lineStyle"
              label="线型"
              initialValue="solid"
            >
              <Select>
                <Option value="solid">实线</Option>
                <Option value="dashed">虚线</Option>
                <Option value="dotted">点线</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="defaultSize"
              label="默认宽度"
              initialValue={2}
            >
              <Input type="number" />
            </Form.Item>
            
            <Collapse>
              <Panel header="属性管理" key="properties">
                <div className="property-management">
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleAddProperty}
                    style={{ marginBottom: 16 }}
                  >
                    添加属性
                  </Button>
                  
                  <Table 
                    columns={[
                      {
                        title: '名称',
                        dataIndex: 'name',
                        key: 'name',
                      },
                      {
                        title: '类型',
                        dataIndex: 'type',
                        key: 'type',
                      },
                      {
                        title: '是否必填',
                        dataIndex: 'required',
                        key: 'required',
                        render: (required: boolean) => required ? '是' : '否',
                      },
                      {
                        title: '操作',
                        key: 'action',
                        render: (_: any, record: Property) => (
                          <div>
                            <Button 
                              type="text" 
                              icon={<EditOutlined />} 
                              onClick={() => handleEditProperty(record)}
                            />
                            <Popconfirm
                              title="确定要删除这个属性吗？"
                              onConfirm={() => handleDeleteProperty(record.id, false)}
                              okText="确定"
                              cancelText="取消"
                            >
                              <Button type="text" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                          </div>
                        ),
                      },
                    ]} 
                    dataSource={edgeTypeProperties} 
                    rowKey="id"
                    style={{ marginBottom: 16 }}
                  />
                  
                  <Form
                    form={propertyForm}
                    layout="vertical"
                    onFinish={(values) => handlePropertySubmit(values, false)}
                    className="property-form"
                  >
                    <Form.Item
                      name="name"
                      label="属性名称"
                      rules={[{ required: true, message: '请输入属性名称' }]}
                    >
                      <Input />
                    </Form.Item>
                    
                    <Form.Item
                      name="type"
                      label="属性类型"
                      initialValue="string"
                      rules={[{ required: true, message: '请选择属性类型' }]}
                    >
                      <Select>
                        <Option value="string">字符串</Option>
                        <Option value="number">数字</Option>
                        <Option value="boolean">布尔值</Option>
                        <Option value="date">日期</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      name="description"
                      label="描述"
                    >
                      <Input.TextArea rows={2} />
                    </Form.Item>
                    
                    <Form.Item
                      name="required"
                      label="是否必填"
                      valuePropName="checked"
                    >
                      <Checkbox />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        {editingProperty ? '更新属性' : '添加属性'}
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </Panel>
            </Collapse>
            
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editingEdgeType ? '更新' : '创建'}
              </Button>
            </Form.Item>
          </Form>
          
          <Table 
            columns={edgeTypeColumns} 
            dataSource={ontology.edgeTypes} 
            rowKey="id"
            className="ontology-designer-table"
          />
        </TabPane>
        
        {/* 类型组 */}
        <TabPane tab="类型组" key="typeGroups">
          <div className="ontology-designer-header">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTypeGroup(null);
                typeGroupForm.resetFields();
              }}
            >
              添加类型组
            </Button>
          </div>
          
          <Form
            form={typeGroupForm}
            layout="vertical"
            onFinish={handleTypeGroupSubmit}
            className="ontology-designer-form"
          >
            <Form.Item
              name="name"
              label="名称"
              rules={[{ required: true, message: '请输入类型组名称' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="描述"
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            
            <Form.Item
              name="nodeTypeIds"
              label="节点类型"
            >
              <Select mode="multiple">
                {ontology.nodeTypes.map((type) => (
                  <Option key={type.id} value={type.id}>{type.name}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="edgeTypeIds"
              label="边类型"
            >
              <Select mode="multiple">
                {ontology.edgeTypes.map((type) => (
                  <Option key={type.id} value={type.id}>{type.name}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editingTypeGroup ? '更新' : '创建'}
              </Button>
            </Form.Item>
          </Form>
          
          <Table 
            columns={typeGroupColumns} 
            dataSource={ontology.typeGroups} 
            rowKey="id"
            className="ontology-designer-table"
          />
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default OntologyDesigner;
