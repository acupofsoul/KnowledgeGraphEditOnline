import React, { useState } from 'react';
import { Card, Form, Input, Select, Switch, Button, Tabs, message, Typography } from 'antd';
import { SaveOutlined, TestTubeOutlined, DatabaseOutlined, BrainOutlined } from '@ant-design/icons';
import { useUIStore } from '../../stores/uiStore';
import { useGraphStore } from '../../stores/graphStore';
import './index.less';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;

const ExternalServices: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const { 
    config, 
    setLLMConfig, 
    setGraphDBConfig, 
    testLLMConnection, 
    testGraphDBConnection 
  } = useUIStore();
  
  const { 
    importFromGraphDB, 
    exportToGraphDB, 
    generateGraphFromLLM, 
    analyzeGraphWithLLM 
  } = useGraphStore();
  
  const [llmPrompt, setLlmPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  
  // 测试大模型连接
  const handleTestLLMConnection = async () => {
    setLoading(true);
    try {
      const success = await testLLMConnection();
      if (success) {
        message.success('大模型连接测试成功');
      } else {
        message.error('大模型连接测试失败');
      }
    } catch (error) {
      message.error('大模型连接测试失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 测试图数据库连接
  const handleTestGraphDBConnection = async () => {
    setLoading(true);
    try {
      const success = await testGraphDBConnection();
      if (success) {
        message.success('图数据库连接测试成功');
      } else {
        message.error('图数据库连接测试失败');
      }
    } catch (error) {
      message.error('图数据库连接测试失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 从图数据库导入数据
  const handleImportFromGraphDB = async () => {
    setLoading(true);
    try {
      await importFromGraphDB();
      message.success('从图数据库导入成功');
    } catch (error) {
      message.error('从图数据库导入失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 导出数据到图数据库
  const handleExportToGraphDB = async () => {
    setLoading(true);
    try {
      await exportToGraphDB();
      message.success('导出到图数据库成功');
    } catch (error) {
      message.error('导出到图数据库失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 使用大模型生成图谱
  const handleGenerateGraphFromLLM = async () => {
    if (!llmPrompt) {
      message.error('请输入生成提示');
      return;
    }
    
    setLoading(true);
    try {
      await generateGraphFromLLM(llmPrompt);
      message.success('图谱生成成功');
    } catch (error) {
      message.error('图谱生成失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 使用大模型分析图谱
  const handleAnalyzeGraphWithLLM = async () => {
    if (!llmPrompt) {
      message.error('请输入分析提示');
      return;
    }
    
    setLoading(true);
    try {
      const result = await analyzeGraphWithLLM(llmPrompt);
      setAnalysisResult(result);
      message.success('图谱分析成功');
    } catch (error) {
      message.error('图谱分析失败');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="external-services">
      <Title level={4}>外部服务配置</Title>
      
      <Tabs defaultActiveKey="llm">
        {/* 大模型配置 */}
        <TabPane tab={<><BrainOutlined /> 大模型配置</>} key="llm">
          <Card>
            <Form
              form={form}
              layout="vertical"
              initialValues={config.externalServices.llm}
              onValuesChange={(values) => {
                setLLMConfig(values);
              }}
            >
              <Form.Item name="enabled" label="启用大模型">
                <Switch />
              </Form.Item>
              
              <Form.Item name="provider" label="服务提供商">
                <Select>
                  <Option value="openai">OpenAI</Option>
                  <Option value="azure">Azure OpenAI</Option>
                  <Option value="anthropic">Anthropic</Option>
                  <Option value="google">Google AI</Option>
                  <Option value="custom">自定义</Option>
                </Select>
              </Form.Item>
              
              <Form.Item name="apiKey" label="API Key" help="大模型服务的API密钥">
                <Input.Password />
              </Form.Item>
              
              <Form.Item name="endpoint" label="API 端点" help="大模型服务的API端点URL">
                <Input />
              </Form.Item>
              
              <Form.Item name="model" label="模型" help="使用的大模型名称">
                <Input />
              </Form.Item>
              
              <Form.Item name="temperature" label="温度" help="生成文本的随机性，0-1之间">
                <Input type="number" min={0} max={1} step={0.1} />
              </Form.Item>
              
              <Form.Item name="maxTokens" label="最大 tokens" help="生成文本的最大长度">
                <Input type="number" min={1} />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<TestTubeOutlined />} 
                  onClick={handleTestLLMConnection}
                  loading={loading}
                >
                  测试连接
                </Button>
              </Form.Item>
            </Form>
          </Card>
          
          <Card title="大模型功能" style={{ marginTop: 16 }}>
            <Form layout="vertical">
              <Form.Item label="提示">
                <Input.TextArea 
                  rows={4} 
                  value={llmPrompt} 
                  onChange={(e) => setLlmPrompt(e.target.value)}
                  placeholder="输入生成或分析图谱的提示..."
                />
              </Form.Item>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <Button 
                  type="primary" 
                  onClick={handleGenerateGraphFromLLM}
                  loading={loading}
                >
                  生成图谱
                </Button>
                <Button 
                  type="default" 
                  onClick={handleAnalyzeGraphWithLLM}
                  loading={loading}
                >
                  分析图谱
                </Button>
              </div>
              
              {analysisResult && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>分析结果：</Text>
                  <div style={{ marginTop: 8, padding: 12, border: '1px solid #f0f0f0', borderRadius: 4, backgroundColor: '#f9f9f9' }}>
                    {analysisResult}
                  </div>
                </div>
              )}
            </Form>
          </Card>
        </TabPane>
        
        {/* 图数据库配置 */}
        <TabPane tab={<><DatabaseOutlined /> 图数据库配置</>} key="graphdb">
          <Card>
            <Form
              layout="vertical"
              initialValues={config.externalServices.graphDB}
              onValuesChange={(values) => {
                setGraphDBConfig(values);
              }}
            >
              <Form.Item name="enabled" label="启用图数据库">
                <Switch />
              </Form.Item>
              
              <Form.Item name="type" label="数据库类型">
                <Select>
                  <Option value="neo4j">Neo4j</Option>
                  <Option value="janusgraph">JanusGraph</Option>
                  <Option value="tigergraph">TigerGraph</Option>
                  <Option value="custom">自定义</Option>
                </Select>
              </Form.Item>
              
              <Form.Item name="host" label="主机">
                <Input />
              </Form.Item>
              
              <Form.Item name="port" label="端口">
                <Input type="number" />
              </Form.Item>
              
              <Form.Item name="username" label="用户名">
                <Input />
              </Form.Item>
              
              <Form.Item name="password" label="密码">
                <Input.Password />
              </Form.Item>
              
              <Form.Item name="database" label="数据库">
                <Input />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<TestTubeOutlined />} 
                  onClick={handleTestGraphDBConnection}
                  loading={loading}
                >
                  测试连接
                </Button>
              </Form.Item>
            </Form>
          </Card>
          
          <Card title="图数据库功能" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button 
                type="primary" 
                icon={<DatabaseOutlined />} 
                onClick={handleImportFromGraphDB}
                loading={loading}
              >
                从数据库导入
              </Button>
              <Button 
                type="default" 
                icon={<SaveOutlined />} 
                onClick={handleExportToGraphDB}
                loading={loading}
              >
                导出到数据库
              </Button>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ExternalServices;