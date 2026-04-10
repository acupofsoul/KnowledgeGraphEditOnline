import React, { useState } from 'react';
import { Layout, Tabs, Button, Table, Form, Input, Select, Checkbox, Modal, message } from 'antd';
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
    if (activeTab === 'concepts') {
      deleteConcept(id);
    } else {
      deleteRelationshipType(id);
    }
    message.success('删除成功');
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
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="属性类型"
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
            name="required"
            label="是否必填"
          >
            <Checkbox />
          </Form.Item>
          <Form.Item
            name="defaultValue"
            label="默认值"
          >
            <Input />
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
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="属性类型"
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
            name="required"
            label="是否必填"
          >
            <Checkbox />
          </Form.Item>
          <Form.Item
            name="defaultValue"
            label="默认值"
          >
            <Input />
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
    setProperties(properties.filter(p => p.id !== id));
    message.success('属性删除成功');
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
    },
    {
      title: '属性数量',
      dataIndex: 'properties',
      key: 'properties',
      render: (properties: Property[]) => properties.length,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Concept | RelationshipType) => (
        <div>
          <Button 
            type="primary" 
            size="small" 
            style={{ marginRight: 8 }} 
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
      <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-4">
        <TabPane tab="概念管理" key="concepts">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">概念管理</h2>
            <Button type="primary" onClick={handleAddItem}>
              添加概念
            </Button>
          </div>
          <Table 
            columns={columns} 
            dataSource={graph.concepts} 
            rowKey="id"
          />
        </TabPane>
        <TabPane tab="关系类型管理" key="relationships">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">关系类型管理</h2>
            <Button type="primary" onClick={handleAddItem}>
              添加关系类型
            </Button>
          </div>
          <Table 
            columns={columns} 
            dataSource={graph.relationshipTypes} 
            rowKey="id"
          />
        </TabPane>
      </Tabs>

      <Modal
        title={editingItem ? (activeTab === 'concepts' ? '编辑概念' : '编辑关系类型') : (activeTab === 'concepts' ? '添加概念' : '添加关系类型')}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item label="属性">
            <div className="mb-4">
              <Button type="dashed" onClick={handleAddProperty} style={{ width: '100%' }}>
                添加属性
              </Button>
            </div>
            <Table 
              columns={[
                { title: '名称', dataIndex: 'name', key: 'name' },
                { title: '类型', dataIndex: 'type', key: 'type' },
                { title: '必填', dataIndex: 'required', key: 'required', render: (required) => required ? '是' : '否' },
                { title: '默认值', dataIndex: 'defaultValue', key: 'defaultValue' },
                {
                  title: '操作',
                  key: 'action',
                  render: (_: any, record: Property) => (
                    <div>
                      <Button 
                        type="primary" 
                        size="small" 
                        style={{ marginRight: 8 }} 
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
            />
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};

export default OntologyPage;
