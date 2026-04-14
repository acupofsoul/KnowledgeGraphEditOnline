import React, { useState, useEffect } from 'react';
import { Button, Modal, Typography, Steps } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Paragraph, Title } = Typography;

const HelpOverlay: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Show help on first visit (mocked by session storage)
    const hasSeenHelp = sessionStorage.getItem('kg-editor-help-seen');
    if (!hasSeenHelp) {
      setIsModalOpen(true);
      sessionStorage.setItem('kg-editor-help-seen', 'true');
    }
  }, []);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const steps = [
    {
      title: 'Create Nodes',
      description: 'Click "Add Class" button or use the context menu to create new nodes.',
    },
    {
      title: 'Create Relationships',
      description: 'Drag from one node to another to create a connection (edge).',
    },
    {
      title: 'Edit Properties',
      description: 'Double-click a node or edge to quick-edit label, or select it to edit details in the Property Panel on the right.',
    },
    {
      title: 'Navigation',
      description: 'Scroll to zoom, drag canvas to pan. Use the toolbar for layout and zoom controls.',
    }
  ];

  return (
    <>
      <Button 
        type="primary" 
        shape="circle" 
        icon={<QuestionCircleOutlined />} 
        style={{ 
            position: 'absolute', 
            bottom: 24, 
            right: 24, 
            zIndex: 100,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)' 
        }}
        onClick={showModal}
      />
      
      <Modal 
        title="Welcome to KG Editor" 
        open={isModalOpen} 
        onOk={handleOk} 
        onCancel={handleCancel}
        footer={[
            <Button key="ok" type="primary" onClick={handleOk}>
              Got it!
            </Button>,
        ]}
        width={600}
      >
        <div style={{ marginTop: 20 }}>
            <Steps
                direction="vertical"
                current={-1}
                items={steps}
            />
        </div>
      </Modal>
    </>
  );
};

export default HelpOverlay;
