import React, { useRef } from 'react';
import { Layout, Button, message, Upload, Progress } from 'antd';
import { useGraphStore } from '../store/useGraphStore';
import { Graph } from '../utils/types';

const { Content } = Layout;
const { Dragger } = Upload;

const DataManagementPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importGraph, exportGraph } = useGraphStore();
  const [progress, setProgress] = React.useState(0);

  // 处理导出为JSON
  const handleExport = () => {
    const graph = exportGraph();
    const jsonStr = JSON.stringify(graph, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graph-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('导出成功');
  };

  // 处理导入JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProgress(0);
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const graph = JSON.parse(result) as Graph;
          importGraph(graph);
          message.success('导入成功');
        }
      } catch (error) {
        message.error('导入失败：文件格式错误');
        console.error('Import error:', error);
      } finally {
        setProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      message.error('导入失败：文件读取错误');
      setProgress(0);
    };

    reader.readAsText(file);
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.json',
    beforeUpload: () => false, // 阻止自动上传
    onChange: (info: any) => {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  return (
    <Content className="p-6">
      <h2 className="text-xl font-bold mb-6">数据管理</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 导出功能 */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">导出数据</h3>
          <p className="mb-4 text-gray-600">将当前知识图谱导出为JSON文件</p>
          <Button 
            type="primary" 
            size="large" 
            onClick={handleExport}
            className="w-full"
          >
            导出为JSON
          </Button>
        </div>

        {/* 导入功能 */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">导入数据</h3>
          <p className="mb-4 text-gray-600">从JSON文件导入知识图谱</p>
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <span className="text-4xl">📁</span>
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域</p>
            <p className="ant-upload-hint">
              支持JSON格式文件，最大文件大小10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button 
              type="default" 
              size="large" 
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 w-full"
            >
              选择文件
            </Button>
          </Dragger>
          
          {progress > 0 && (
            <Progress 
              percent={progress} 
              status="active" 
              className="mt-4"
            />
          )}
        </div>
      </div>

      <div className="mt-8 border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">数据统计</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-500">{useGraphStore.getState().graph.concepts.length}</div>
            <div className="text-gray-600">概念数量</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-500">{useGraphStore.getState().graph.relationshipTypes.length}</div>
            <div className="text-gray-600">关系类型数量</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-500">{useGraphStore.getState().graph.nodes.length}</div>
            <div className="text-gray-600">节点数量</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-500">{useGraphStore.getState().graph.relationships.length}</div>
            <div className="text-gray-600">关系数量</div>
          </div>
        </div>
      </div>
    </Content>
  );
};

export default DataManagementPage;
