import React from 'react';
import { Button, Dropdown, Menu, Tooltip, Divider } from 'antd';
import { 
  ImportOutlined, 
  ExportOutlined, 
  UndoOutlined, 
  RedoOutlined, 
  LayoutOutlined, 
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  ReloadOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';
import { useGraphStore } from '../../stores/graphStore';
import { useUIStore } from '../../stores/uiStore';
import { useHistoryStore } from '../../stores/historyStore';
import { ExportFormat } from '../../types';
import './index.less';

const Toolbar: React.FC = () => {
  // 状态管理
  const { 
    clearGraph, 
    importGraph, 
    exportGraph, 
    deleteSelected,
    undo, 
    redo,
    saveGraph,
    loadGraph
  } = useGraphStore();
  const {
    selection,
    config,
    setLayout,
    toggleSidePanel,
    toggleOntologyDesigner,
    toggleHelpPanel,
    setCanvasAutoFit
  } = useUIStore();
  const { 
    canUndo, 
    canRedo,
    clearHistory 
  } = useHistoryStore();
  
  // 处理导入
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            importGraph(data);
          } catch (error) {
            console.error('导入失败:', error);
          }
        };
        reader.readAsText(target.files[0]);
      }
    };
    input.click();
  };
  
  // 处理导出
  const handleExport = (format: ExportFormat) => {
    const data = exportGraph(format);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-graph.${format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'jsonld'}`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // 导出菜单
  const exportMenu = (
    <Menu>
      <Menu.Item key="json" onClick={() => handleExport('json')}>
        JSON 格式
      </Menu.Item>
      <Menu.Item key="csv" onClick={() => handleExport('csv')}>
        CSV 格式
      </Menu.Item>
      <Menu.Item key="json-ld" onClick={() => handleExport('json-ld')}>
        JSON-LD 格式
      </Menu.Item>
    </Menu>
  );
  
  // 布局菜单
  const layoutMenu = (
    <Menu>
      <Menu.Item key="force" onClick={() => setLayout('force')}>
        力导向布局
      </Menu.Item>
      <Menu.Item key="dagre" onClick={() => setLayout('dagre')}>
        层次布局
      </Menu.Item>
      <Menu.Item key="radial" onClick={() => setLayout('radial')}>
        辐射布局
      </Menu.Item>
      <Menu.Item key="circular" onClick={() => setLayout('circular')}>
        环形布局
      </Menu.Item>
      <Menu.Item key="grid" onClick={() => setLayout('grid')}>
        网格布局
      </Menu.Item>
    </Menu>
  );
  
  // 处理删除选中
  const handleDeleteSelected = () => {
    deleteSelected(selection.selectedNodes, selection.selectedEdges);
  };
  
  // 处理清空画布
  const handleClearCanvas = () => {
    if (window.confirm('确定要清空画布吗？')) {
      clearGraph();
      clearHistory();
    }
  };
  
  // 处理保存
  const handleSave = () => {
    saveGraph();
  };
  
  // 处理加载
  const handleLoad = () => {
    loadGraph();
  };
  
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <Tooltip title="导入">
          <Button icon={<ImportOutlined />} onClick={handleImport} />
        </Tooltip>
        
        <Tooltip title="加载">
          <Button icon={<FolderOpenOutlined />} onClick={handleLoad} />
        </Tooltip>
        
        <Dropdown overlay={exportMenu} trigger={['click']}>
          <Button icon={<ExportOutlined />}>
            导出
          </Button>
        </Dropdown>
        
        <Tooltip title="保存">
          <Button icon={<SaveOutlined />} onClick={handleSave} />
        </Tooltip>
        
        <Divider type="vertical" />
        
        <Tooltip title="撤销">
          <Button 
            icon={<UndoOutlined />} 
            onClick={undo} 
            disabled={!canUndo()}
          />
        </Tooltip>
        
        <Tooltip title="重做">
          <Button 
            icon={<RedoOutlined />} 
            onClick={redo} 
            disabled={!canRedo()}
          />
        </Tooltip>
        
        <Divider type="vertical" />
        
        <Tooltip title="添加节点">
          <Button icon={<PlusOutlined />} />
        </Tooltip>
        
        <Tooltip title="删除选中">
          <Button 
            icon={<DeleteOutlined />} 
            onClick={handleDeleteSelected}
            disabled={selection.selectedNodes.length === 0 && selection.selectedEdges.length === 0}
          />
        </Tooltip>
        
        <Tooltip title="清空画布">
          <Button icon={<ReloadOutlined />} onClick={handleClearCanvas} />
        </Tooltip>
      </div>
      
      <div className="toolbar-right">
        <Tooltip title="布局">
          <Dropdown overlay={layoutMenu} trigger={['click']}>
            <Button icon={<LayoutOutlined />}>
              布局
            </Button>
          </Dropdown>
        </Tooltip>
        
        <Tooltip title="自动适应">
          <Button 
            onClick={() => setCanvasAutoFit(!config.canvas.autoFit)}
            type={config.canvas.autoFit ? 'primary' : 'default'}
          >
            自动适应
          </Button>
        </Tooltip>
        
        <Tooltip title="属性面板">
          <Button 
            onClick={() => toggleSidePanel()}
            type={config.view.sidePanel.visible ? 'primary' : 'default'}
          >
            属性
          </Button>
        </Tooltip>
        
        <Tooltip title="本体设计器">
          <Button onClick={() => toggleOntologyDesigner()}>
            本体
          </Button>
        </Tooltip>
        
        <Tooltip title="帮助">
          <Button onClick={() => toggleHelpPanel()}>
            帮助
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};



export default Toolbar;
