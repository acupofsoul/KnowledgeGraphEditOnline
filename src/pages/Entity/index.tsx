import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Button, Space, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

interface EntityDataType {
  key: string;
  name: string;
  type: string;
  description: string;
}

const data: EntityDataType[] = [
  {
    key: '1',
    name: 'John Doe',
    type: 'Person',
    description: 'Software Engineer',
  },
  {
    key: '2',
    name: 'Google',
    type: 'Organization',
    description: 'Tech Giant',
  },
  {
    key: '3',
    name: 'New York',
    type: 'Location',
    description: 'City',
  },
];

const columns: ColumnsType<EntityDataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <a>Edit</a>
        <a>Delete</a>
      </Space>
    ),
  },
];

const EntityPage: React.FC = () => {
  return (
    <PageContainer title="Entity Editor" extra={<Button type="primary">Add Entity</Button>}>
      <Card>
        <div style={{ marginBottom: 16 }}>
             <Input.Search placeholder="Search entities" style={{ width: 300 }} />
        </div>
        <Table columns={columns} dataSource={data} />
      </Card>
    </PageContainer>
  );
};

export default EntityPage;
