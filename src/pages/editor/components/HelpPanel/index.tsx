import React, { useState } from 'react';
import { Modal, Tabs, Typography, Input, Divider, List } from 'antd';
import { SearchOutlined, QuestionCircleOutlined, BookOutlined, KeyOutlined, StarOutlined } from '@ant-design/icons';
import { useUIStore } from '../../stores/uiStore';
import './index.less';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const HelpPanel: React.FC = () => {
  const { helpPanel, toggleHelpPanel, setHelpPanelSection } = useUIStore();
  const [searchText, setSearchText] = useState('');
  
  // 常见问题数据
  const faqData = [
    {
      question: '如何创建一个新的节点？',
      answer: '在画布空白处点击鼠标左键，即可创建一个新节点。您也可以使用快捷键 Ctrl/Cmd + N 快速创建新节点。',
    },
    {
      question: '如何创建节点之间的关系？',
      answer: '从一个节点拖拽到另一个节点，即可创建一条边。边代表节点之间的关系。',
    },
    {
      question: '如何编辑节点或边的属性？',
      answer: '选中节点或边，右侧会显示属性面板，您可以在其中编辑其属性，包括标签、类型和自定义属性。',
    },
    {
      question: '如何删除节点或边？',
      answer: '选中要删除的节点或边，按 Delete 键或 Backspace 键，或使用右键菜单中的删除选项。',
    },
    {
      question: '如何调整图谱的布局？',
      answer: '使用工具栏中的布局按钮，选择不同的布局算法，如力导向、层次、辐射、环形或网格布局。',
    },
    {
      question: '如何导入或导出图谱数据？',
      answer: '使用工具栏中的导入/导出按钮，导入或导出图谱数据。支持 JSON、CSV 和 JSON-LD 格式。',
    },
    {
      question: '如何撤销或重做操作？',
      answer: '使用快捷键 Ctrl/Cmd + Z 撤销操作，Ctrl/Cmd + Y 重做操作。您也可以使用工具栏中的撤销/重做按钮。',
    },
    {
      question: '如何创建和管理节点类型和边类型？',
      answer: '使用工具栏中的本体设计器按钮，打开本体设计器，您可以在其中创建和管理节点类型、边类型和类型组。',
    },
  ];
  
  // 过滤常见问题
  const filteredFaq = searchText
    ? faqData.filter(item => 
        item.question.toLowerCase().includes(searchText.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchText.toLowerCase())
      )
    : faqData;
  
  return (
    <Modal
      title="帮助中心"
      open={helpPanel.visible}
      onCancel={() => toggleHelpPanel(false)}
      width={600}
      footer={null}
      className="help-panel-modal"
    >
      {/* 搜索框 */}
      <Search
        placeholder="搜索帮助内容"
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 20 }}
      />
      
      <Tabs 
        activeKey={helpPanel.activeSection}
        onChange={(key) => setHelpPanelSection(key as "getting-started" | "keyboard-shortcuts" | "advanced")}
        className="help-panel-tabs"
      >
        {/* 入门指南 */}
        <TabPane tab={<><BookOutlined /> 入门指南</>} key="getting-started">
          <Title level={4}>快速开始</Title>
          <Paragraph>
            欢迎使用知识图谱编辑器！这是一个功能强大的工具，用于创建和管理知识图谱。
          </Paragraph>
          
          <List
            itemLayout="vertical"
            dataSource={[
              {
                title: '创建节点',
                description: '在画布空白处点击鼠标左键，即可创建一个新节点。',
              },
              {
                title: '创建边',
                description: '从一个节点拖拽到另一个节点，即可创建一条边。',
              },
              {
                title: '编辑属性',
                description: '选中节点或边，在右侧属性面板中编辑其属性。',
              },
              {
                title: '删除元素',
                description: '选中节点或边，按 Delete 键或使用右键菜单删除。',
              },
              {
                title: '调整布局',
                description: '使用工具栏中的布局按钮，选择不同的布局算法。',
              },
              {
                title: '导入/导出',
                description: '使用工具栏中的导入/导出按钮，导入或导出图谱数据。',
              },
            ]}
            renderItem={(item: { title: string; description: string }) => (
              <List.Item>
                <List.Item.Meta
                  title={item.title}
                  description={item.description}
                />
              </List.Item>
            )}
          />
        </TabPane>
        
        {/* 键盘快捷键 */}
        <TabPane tab={<><KeyOutlined /> 键盘快捷键</>} key="keyboard-shortcuts">
          <Title level={4}>常用快捷键</Title>
          <List
            itemLayout="vertical"
            dataSource={[
              {
                title: 'Ctrl/Cmd + N',
                description: '创建新节点',
              },
              {
                title: 'Delete / Backspace',
                description: '删除选中元素',
              },
              {
                title: 'Ctrl/Cmd + C',
                description: '复制选中元素',
              },
              {
                title: 'Ctrl/Cmd + V',
                description: '粘贴元素',
              },
              {
                title: 'Ctrl/Cmd + Z',
                description: '撤销',
              },
              {
                title: 'Ctrl/Cmd + Y',
                description: '重做',
              },
              {
                title: 'Ctrl/Cmd + A',
                description: '全选',
              },
              {
                title: 'Space',
                description: '拖拽画布',
              },
              {
                title: 'Mouse Wheel',
                description: '缩放画布',
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={<Text strong>{item.title}</Text>}
                  description={item.description}
                />
              </List.Item>
            )}
          />
        </TabPane>
        
        {/* 高级功能 */}
        <TabPane tab={<><StarOutlined /> 高级功能</>} key="advanced">
          <Title level={4}>高级功能</Title>
          <Paragraph>
            本编辑器提供了以下高级功能：
          </Paragraph>
          
          <List
            itemLayout="vertical"
            dataSource={[
              {
                title: '本体设计',
                description: '通过本体设计器，您可以创建和管理节点类型、边类型和类型组。',
              },
              {
                title: '自定义属性',
                description: '为节点和边添加自定义属性，丰富图谱数据。',
              },
              {
                title: '多种布局算法',
                description: '支持力导向、层次、辐射、环形和网格布局。',
              },
              {
                title: '多格式导出',
                description: '支持导出为 JSON、CSV 和 JSON-LD 格式。',
              },
              {
                title: '实时验证',
                description: '实时验证图谱数据的完整性和正确性。',
              },
            ]}
            renderItem={(item: { title: string; description: string }) => (
              <List.Item>
                <List.Item.Meta
                  title={item.title}
                  description={item.description}
                />
              </List.Item>
            )}
          />
        </TabPane>
        
        {/* 常见问题 */}
        <TabPane tab={<><QuestionCircleOutlined /> 常见问题</>} key="faq">
          <Title level={4}>常见问题</Title>
          <Paragraph>
            这里是一些用户经常问到的问题及其解答。
          </Paragraph>
          
          {filteredFaq.length > 0 ? (
            <List
              itemLayout="vertical"
              dataSource={filteredFaq}
              renderItem={(item: { question: string; answer: string }) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text strong>{item.question}</Text>}
                    description={item.answer}
                  />
                  <Divider style={{ margin: '10px 0' }} />
                </List.Item>
              )}
            />
          ) : (
            <Paragraph style={{ textAlign: 'center', color: '#999' }}>
              没有找到匹配的内容，请尝试其他关键词。
            </Paragraph>
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default HelpPanel;
