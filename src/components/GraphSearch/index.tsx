import React, { useState } from 'react';
import { Select, Switch, Space, Typography, Input } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { IGraphNode } from '@/types';

interface GraphSearchProps {
  nodes: IGraphNode[];
  onSelect: (id: string) => void;
  onFilter: (text: string) => void;
}

const GraphSearch: React.FC<GraphSearchProps> = ({ nodes, onSelect, onFilter }) => {
  const [filterMode, setFilterMode] = useState(false);

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 10,
      width: 280,
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '8px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
      <Space justify="space-between" style={{ padding: '0 4px' }}>
        <Space>
            {filterMode ? <FilterOutlined /> : <SearchOutlined />}
            <Typography.Text style={{ fontSize: 12, fontWeight: 500 }}>
                {filterMode ? 'Filter Mode' : 'Search Mode'}
            </Typography.Text>
        </Space>
        <Switch 
            size="small" 
            checked={filterMode} 
            onChange={(checked) => {
                setFilterMode(checked);
                if (!checked) onFilter('');
            }} 
        />
      </Space>
      
      {filterMode ? (
        <Input
            placeholder="Type to filter nodes..."
            onChange={(e) => onFilter(e.target.value)}
            allowClear
            prefix={<FilterOutlined style={{ color: '#ccc' }} />}
        />
      ) : (
        <Select
            showSearch
            style={{ width: '100%' }}
            placeholder="Search nodes..."
            optionFilterProp="children"
            filterOption={(input, option) =>
            (option?.label ? String(option.label) : '').toLowerCase().includes(input.toLowerCase())
            }
            onChange={(value) => onSelect(value)}
            suffixIcon={<SearchOutlined />}
            options={nodes.map(node => ({
            value: node.id,
            label: node.style?.labelText || node.id
            }))}
        />
      )}
    </div>
  );
};

export default GraphSearch;
