import React from 'react';
import { Menu } from 'antd';
import { useGraphStore } from '../../stores/graphStore';
import { useUIStore } from '../../stores/uiStore';
import { useOntologyStore } from '../../stores/ontologyStore';
import './index.less';

const ContextMenu: React.FC = () => {
  // 状态管理
  const { deleteNode, deleteEdge, addNode } = useGraphStore();
  const { contextMenu, setContextMenu } = useUIStore();
  const { ontology } = useOntologyStore();
  
  // 处理菜单项点击
  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'add-node':
        // 在右键点击位置添加新节点
        addNode({
          label: '新节点',
          type: ontology.nodeTypes[0].id,
          properties: {},
          x: contextMenu.x,
          y: contextMenu.y,
        });
        break;
      case 'delete':
        if (contextMenu.type === 'node' && contextMenu.entityId) {
          deleteNode(contextMenu.entityId);
        } else if (contextMenu.type === 'edge' && contextMenu.entityId) {
          deleteEdge(contextMenu.entityId);
        }
        break;
      case 'copy':
        // 复制功能
        break;
      case 'paste':
        // 粘贴功能
        break;
      default:
        break;
    }
    
    // 关闭上下文菜单
    setContextMenu({ visible: false });
  };
  
  // 渲染节点菜单
  const renderNodeMenu = () => {
    return (
      <Menu onClick={(e) => handleMenuClick(e.key)}>
        <Menu.Item key="delete">删除节点</Menu.Item>
        <Menu.Item key="copy">复制节点</Menu.Item>
        <Menu.Item key="paste">粘贴节点</Menu.Item>
      </Menu>
    );
  };
  
  // 渲染边菜单
  const renderEdgeMenu = () => {
    return (
      <Menu onClick={(e) => handleMenuClick(e.key)}>
        <Menu.Item key="delete">删除边</Menu.Item>
      </Menu>
    );
  };
  
  // 渲染画布菜单
  const renderCanvasMenu = () => {
    return (
      <Menu onClick={(e) => handleMenuClick(e.key)}>
        <Menu.Item key="add-node">添加节点</Menu.Item>
        <Menu.Item key="paste">粘贴</Menu.Item>
      </Menu>
    );
  };
  
  if (!contextMenu.visible) {
    return null;
  }
  
  return (
    <div 
      className="context-menu"
      style={{
        position: 'fixed',
        left: contextMenu.x,
        top: contextMenu.y,
        zIndex: 10000,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {contextMenu.type === 'node' && renderNodeMenu()}
      {contextMenu.type === 'edge' && renderEdgeMenu()}
      {contextMenu.type === 'canvas' && renderCanvasMenu()}
    </div>
  );
};

export default ContextMenu;
