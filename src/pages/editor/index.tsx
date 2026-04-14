import React from 'react';
import { Layout } from 'antd';
import Canvas from './components/Canvas';
import SidePanel from './components/SidePanel';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import ContextMenu from './components/ContextMenu';
import { useUIStore } from './stores/uiStore';
import './index.less';

const { Header, Content, Sider } = Layout;

const Editor: React.FC = () => {
  const { config } = useUIStore();
  
  return (
    <Layout style={{ height: '100vh' }}>
      {/* 工具栏 */}
      <Header style={{ height: 60, padding: 0 }}>
        <Toolbar />
      </Header>
      
      {/* 主内容区 */}
      <Layout style={{ flex: 1, overflow: 'hidden' }}>
        {/* 画布 */}
        <Content style={{ flex: 1, overflow: 'hidden' }}>
          <Canvas />
        </Content>
        
        {/* 侧边栏 */}
        {config.view.sidePanel.visible && (
          <Sider 
            width={config.view.sidePanel.width} 
            style={{ height: 'calc(100vh - 60px - 32px)' }}
            theme="light"
          >
            <SidePanel />
          </Sider>
        )}
      </Layout>
      
      {/* 状态栏 */}
      <Header style={{ height: 32, padding: 0, borderTop: '1px solid #e8e8e8' }}>
        <StatusBar />
      </Header>
      
      {/* 上下文菜单 */}
      <ContextMenu />
    </Layout>
  );
};

export default Editor;
