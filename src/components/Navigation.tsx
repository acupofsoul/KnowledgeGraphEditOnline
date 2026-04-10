import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';

const { Sider } = Layout;

const Navigation: React.FC = () => {
  const location = useLocation();
  
  return (
    <Sider width={200} theme="light" className="h-screen">
      <div className="p-4 text-xl font-bold text-center">知识图谱编辑器</div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: '100%', borderRight: 0 }}
      >
        <Menu.Item key="/" icon={<span className="text-lg">📋</span>}>
          <Link to="/">本体构建</Link>
        </Menu.Item>
        <Menu.Item key="/graph" icon={<span className="text-lg">🎨</span>}>
          <Link to="/graph">图谱编辑</Link>
        </Menu.Item>
        <Menu.Item key="/data" icon={<span className="text-lg">💾</span>}>
          <Link to="/data">数据管理</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Navigation;
