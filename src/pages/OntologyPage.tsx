import React, { useState } from 'react';
import { Layout, Tabs, Button, Table, Form, Input, Select, Checkbox, Modal, message, Card, Divider } from 'antd';
import { useGraphStore } from '../store/useGraphStore';
import { Concept, RelationshipType, Property } from '../utils/types';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;

const OntologyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('concepts');
  const [form] = Form.useForm();
  const [propertyForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Concept | RelationshipType | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  
  const {
    graph,
    addConcept,
    updateConcept,
    deleteConcept,
    addRelationshipType,
    updateRelationshipType,
    deleteRelationshipType
  } = useGraphStore();

  const handleAddItem = () => {
    setEditingItem(null);
    setProperties([]);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditItem = (item: Concept | RelationshipType) => {
    setEditingItem(item);
    setProperties(item.properties);
    form.setFieldsValue({ name: item.name });
    setIsModalVisible(true);
  };

  const handleDeleteItem = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: activeTab === 'concepts' ? '确定要删除这个概念吗？' : '确定要删除这个关系类型吗？',
      onOk: () => {
        if (activeTab === 'concepts') {
          deleteConcept(id);
        } else {
          deleteRelationshipType(id);
        }
        message.success('删除成功');
      },
    });
  };

  const handleAddProperty = () => {
    propertyForm.resetFields();
    setEditingProperty(null);
    Modal.confirm({
      title: '添加属性',
      content: (
        <Form form={propertyForm} layout="vertical">
          <Form.Item
            name="name"
            label="属性名称"
            rules={[{ required: true, message: '请输入属性名称' }]}
          >
            <Input placeholder="请输入属性名称" />
          </Form.Item>
          <Form.Item
            name="type"
            label="属性类型"
            rules={[{ required: true, message: '请选择属性类型' }]}
          >
            <Select placeholder="请选择属性类型">
              <Option value="string">字符串</Option>
              <Option value="number">数字</Option>
              <Option value="boolean">布尔值</Option>
              <Option value="date">日期</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="required"
            label="是否必填"
            valuePropName="checked"
          >
            <Checkbox />
          </Form.Item>
          <Form.Item
            name="defaultValue"
            label="默认值"
          >
            <Input placeholder="请输入默认值" />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          const values = await propertyForm.validateFields();
          const newProperty: Property = {
            id: crypto.randomUUID(),
            ...values
          };
          setProperties([...properties, newProperty]);
          message.success('属性添加成功');
        } catch (error) {
          console.error('验证失败:', error);
        }
      },
    });
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    propertyForm.setFieldsValue(property);
    Modal.confirm({
      title: '编辑属性',
      content: (
        <Form form={propertyForm} layout="vertical">
          <Form.Item
            name="name"
            label="属性名称"
            rules={[{ required: true, message: '请输入属性名称' }]}
          >
            <Input placeholder="请输入属性名称" />
          </Form.Item>
          <Form.Item
            name="type"
            label="属性类型"
            rules={[{ required: true, message: '请选择属性类型' }]}
          >
            <Select placeholder="请选择属性类型">
              <Option value="string">字符串</Option>
              <Option value="number">数字</Option>
              <Option value="boolean">布尔值</Option>
              <Option value="date">日期</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="required"
            label="是否必填"
            valuePropName="checked"
          >
            <Checkbox />
          </Form.Item>
          <Form.Item
            name="defaultValue"
            label="默认值"
          >
            <Input placeholder="请输入默认值" />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          const values = await propertyForm.validateFields();
          const updatedProperties = properties.map(p => 
            p.id === property.id ? { ...p, ...values } : p
          );
          setProperties(updatedProperties);
          message.success('属性更新成功');
        } catch (error) {
          console.error('验证失败:', error);
        }
      },
    });
  };

  const handleDeleteProperty = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个属性吗？',
      onOk: () => {
        setProperties(properties.filter(p => p.id !== id));
        message.success('属性删除成功');
      },
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (activeTab === 'concepts') {
        if (editingItem) {
          updateConcept(editingItem.id, {
            name: values.name,
            properties
          });
          message.success('概念更新成功');
        } else {
          addConcept({
            name: values.name,
            properties
          });
          message.success('概念创建成功');
        }
      } else {
        if (editingItem) {
          updateRelationshipType(editingItem.id, {
            name: values.name,
            properties
          });
          message.success('关系类型更新成功');
        } else {
          addRelationshipType({
            name: values.name,
            properties
          });
          message.success('关系类型创建成功');
        }
      }
      
      setIsModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
    },
    {
      title: '属性数量',
      dataIndex: 'properties',
      key: 'properties',
      width: '30%',
      render: (properties: Property[]) => (
        <span className="text-blue-500 font-medium">{properties.length}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: '30%',
      fixed: 'right' as const,
      render: (_: any, record: Concept | RelationshipType) => (
        <div className="flex gap-2">
          <Button 
            type="primary" 
            size="small" 
            onClick={() => handleEditItem(record)}
          >
            编辑
          </Button>
          <Button 
            danger 
            size="small" 
            onClick={() => handleDeleteItem(record.id)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Content className="p-6">
      <Card className="mb-6">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="概念管理" key="concepts">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">概念管理</h2>
              <Button type="primary" onClick={handleAddItem}>
                添加概念
              </Button>
            </div>
            <Divider />
            <Table 
              columns={columns} 
              dataSource={graph.concepts} 
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 个概念`,
              }}
              className="shadow-sm"
            />
          </TabPane>
          <TabPane tab="关系类型管理" key="relationships">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">关系类型管理</h2>
              <Button type="primary" onClick={handleAddItem}>
                添加关系类型
              </Button>
            </div>
            <Divider />
            <Table 
              columns={columns} 
              dataSource={graph.relationshipTypes} 
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 个关系类型`,
              }}
              className="shadow-sm"
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingItem ? (activeTab === 'concepts' ? '编辑概念' : '编辑关系类型') : (activeTab === 'concepts' ? '添加概念' : '添加关系类型')}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入名称" size="large" />
          </Form.Item>
          
          <Form.Item label="属性">
            <div className="mb-4">
              <Button type="dashed" onClick={handleAddProperty} style={{ width: '100%' }}>
                添加属性
              </Button>
            </div>
            <Card>
              <Table 
                columns={[
                  { title: '名称', dataIndex: 'name', key: 'name', width: '25%' },
                  { 
                    title: '类型', 
                    dataIndex: 'type', 
                    key: 'type',
                    width: '20%',
                    render: (type: string) => {
                      const typeMap: Record<string, string> = {
                        'string': '字符串',
                        'number': '数字',
                        'boolean': '布尔值',
                        'date': '日期'
                      };
                      return typeMap[type] || type;
                    }
                  },
                  { 
                    title: '必填', 
                    dataIndex: 'required', 
                    key: 'required',
                    width: '15%',
                    render: (required: boolean) => (
                      <span className={required ? 'text-red-500' : 'text-gray-500'}>
                        {required ? '是' : '否'}
                      </span>
                    ) 
                  },
                  { title: '默认值', dataIndex: 'defaultValue', key: 'defaultValue', width: '25%' },
                  {
                    title: '操作',
                    key: 'action',
                    width: '15%',
                    render: (_: any, record: Property) => (
                      <div className="flex gap-2">
                        <Button 
                          type="primary" 
                          size="small" 
                          onClick={() => handleEditProperty(record)}
                        >
                          编辑
                        </Button>
                        <Button 
                          danger 
                          size="small" 
                          onClick={() => handleDeleteProperty(record.id)}
                        >
                          删除
                        </Button>
                      </div>
                    ),
                  },
                ]} 
                dataSource={properties} 
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};

export default OntologyPage;
