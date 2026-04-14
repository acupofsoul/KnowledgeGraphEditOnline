import { PageContainer } from '@ant-design/pro-components';
import { Card, Typography } from 'antd';
import React from 'react';

const HomePage: React.FC = () => {
  return (
    <PageContainer>
      <Card>
        <Typography.Title level={2}>Welcome to KG Editor</Typography.Title>
        <Typography.Paragraph>
          This is an online tool for editing Knowledge Graph Ontologies and Entities.
        </Typography.Paragraph>
        <Typography.Paragraph>
          Select a module from the menu to start.
        </Typography.Paragraph>
      </Card>
    </PageContainer>
  );
};

export default HomePage;
