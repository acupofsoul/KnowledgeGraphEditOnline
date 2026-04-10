import React, { useRef, useState } from 'react';
import { Layout, Button, message, Upload, Progress, Card, Statistic, Row, Col, Spin } from 'antd';
import { DownloadOutlined, UploadOutlined, BarChartOutlined } from '@ant-design/icons';
import { useGraphStore } from '../store/useGraphStore';
import { Graph } from '../utils/types';

const { Content } = Layout;
const { Dragger } = Upload;

const DataManagementPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importGraph, exportGraph, graph } = useGraphStore();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  // 处理导出为JSON
  const handleExport = async () => {
    try {
      setLoading(true);
      const graphData = exportGraph();
      const jsonStr = JSON.stringify(graphData, null, 2);
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
    } catch (error) {
      message.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理导入JSON
  const handleImport = (file: File) => {
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
          const graphData = JSON.parse(result) as Graph;
          // 验证数据结构
          if (Array.isArray(graphData.concepts) && 
              Array.isArray(graphData.relationshipTypes) && 
              Array.isArray(graphData.nodes) && 
              Array.isArray(graphData.relationships)) {
            importGraph(graphData);
            message.success('导入成功');
          } else {
            throw new Error('文件格式错误：缺少必要的字段');
          }
        }
      } catch (error) {
        message.error('导入失败：' + (error instanceof Error ? error.message : '文件格式错误'));
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
    beforeUpload: (file: File) => {
      handleImport(file);
      return false; // 阻止自动上传
    },
    onChange: (info: any) => {
      // 这里可以添加额外的状态处理
    },
  };

  // 计算额外的统计数据
  const getNodeCountByConcept = () => {
    const counts: Record<string, number> = {};
    graph.concepts.forEach(concept => {
      counts[concept.name] = graph.nodes.filter(node => node.conceptId === concept.id).length;
    });
    return counts;
  };

  const getRelationshipCountByType = () => {
    const counts: Record<string, number> = {};
    graph.relationshipTypes.forEach(type => {
      counts[type.name] = graph.relationships.filter(rel => rel.relationshipTypeId === type.id).length;
    });
    return counts;
  };

  const nodeCountByConcept = getNodeCountByConcept();
  const relationshipCountByType = getRelationshipCountByType();

  return (
    <Content className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">数据管理</h2>
        <BarChartOutlined className="text-blue-500" style={{ fontSize: '24px' }} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 导出功能 */}
        <Card 
          title="导出数据" 
          bordered={false}
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="mb-4 text-gray-600">将当前知识图谱导出为JSON文件</p>
          <Button 
            type="primary" 
            size="large" 
            onClick={handleExport}
            icon={<DownloadOutlined />}
            loading={loading}
            className="w-full"
          >
            导出为JSON
          </Button>
        </Card>

        {/* 导入功能 */}
        <Card 
          title="导入数据" 
          bordered={false}
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="mb-4 text-gray-600">从JSON文件导入知识图谱</p>
          <Dragger {...uploadProps} className="mb-4">
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域</p>
            <p className="ant-upload-hint">
              支持JSON格式文件，最大文件大小10MB
            </p>
          </Dragger>
          
          <Button 
            type="default" 
            size="large" 
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            选择文件
          </Button>
          
          {progress > 0 && (
            <Progress 
              percent={progress} 
              status="active" 
              className="mt-4"
              strokeColor="#1890ff"
            />
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImport(file);
              }
            }}
            className="hidden"
          />
        </Card>
      </div>

      <Card 
        title="数据统计" 
        bordered={false}
        className="mt-8 shadow-sm"
      >
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Statistic 
              title="概念数量" 
              value={graph.concepts.length} 
              prefix={<span className="text-blue-500">📚</span>} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="关系类型数量" 
              value={graph.relationshipTypes.length} 
              prefix={<span className="text-green-500">🔗</span>} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="节点数量" 
              value={graph.nodes.length} 
              prefix={<span className="text-orange-500">📦</span>} 
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="关系数量" 
              value={graph.relationships.length} 
              prefix={<span className="text-purple-500">⚡</span>} 
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
        </Row>

        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-4">节点按概念分布</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(nodeCountByConcept).map(([concept, count]) => (
              <div key={concept} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{concept}</span>
                  <span className="text-blue-500 font-bold">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (count / Math.max(...Object.values(nodeCountByConcept), 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {Object.keys(nodeCountByConcept).length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                暂无数据
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-4">关系按类型分布</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(relationshipCountByType).map(([type, count]) => (
              <div key={type} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{type}</span>
                  <span className="text-green-500 font-bold">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (count / Math.max(...Object.values(relationshipCountByType), 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {Object.keys(relationshipCountByType).length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                暂无数据
              </div>
            )}
          </div>
        </div>
      </Card>
    </Content>
  );
};

export default DataManagementPage;
