import React from 'react';
import { Form, Input, Typography, Empty, Card, ColorPicker, Select, InputNumber } from 'antd';
import { IGraphNode, IGraphEdge } from '@/types';

const { Title, Text } = Typography;

interface PropertyPanelProps {
  selectedItem: { type: 'node' | 'edge'; id: string } | null;
  itemData: IGraphNode | IGraphEdge | undefined;
  onUpdate: (id: string, data: any) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ selectedItem, itemData, onUpdate }) => {
  if (!selectedItem || !itemData) {
    return (
      <div style={{ 
        padding: 32, 
        textAlign: 'center', 
        color: '#999',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Select a node or edge to edit" />
      </div>
    );
  }

  const isNode = selectedItem.type === 'node';

  const onValuesChange = (changedValues: any) => {
    let newStyle = { ...itemData.style };

    if (changedValues.label !== undefined) {
      newStyle.labelText = changedValues.label;
    }
    
    if (changedValues.fill) {
      const color = typeof changedValues.fill === 'string' ? changedValues.fill : changedValues.fill.toHexString();
      newStyle.fill = color;
    }
    
    if (changedValues.stroke) {
        const color = typeof changedValues.stroke === 'string' ? changedValues.stroke : changedValues.stroke.toHexString();
        newStyle.stroke = color;
    }

    if (changedValues.lineWidth !== undefined) {
        newStyle.lineWidth = changedValues.lineWidth;
    }

    if (changedValues.size !== undefined) {
        newStyle.size = changedValues.size;
    }

    if (changedValues.iconText !== undefined) {
        newStyle.iconText = changedValues.iconText;
    }

    if (changedValues.lineDash !== undefined) {
        newStyle.lineDash = changedValues.lineDash === 'solid' ? [] : [5, 5];
    }

    onUpdate(selectedItem.id, { style: newStyle });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '16px 24px', 
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa'
      }}>
        <Title level={5} style={{ margin: 0 }}>
          {isNode ? 'Class Properties' : 'Relation Properties'}
        </Title>
        <Text type="secondary" style={{ fontSize: 12 }}>
          ID: {itemData.id}
        </Text>
      </div>
      
      <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
        <Form 
          layout="vertical" 
          initialValues={{ 
            id: itemData.id, 
            label: itemData.style?.labelText,
            fill: itemData.style?.fill || '#C6E5FF',
            stroke: itemData.style?.stroke || '#5B8FF9',
            size: itemData.style?.size || 40,
            iconText: itemData.style?.iconText || '',
            lineWidth: itemData.style?.lineWidth || 2,
            lineDash: (itemData.style?.lineDash && itemData.style?.lineDash.length > 0) ? 'dashed' : 'solid'
          }}
          key={selectedItem.id} 
          onValuesChange={onValuesChange}
        >
          <Card title="Basic Info" size="small" style={{ marginBottom: 16 }}>
             <Form.Item label="Label" name="label">
               <Input placeholder="Enter label" />
             </Form.Item>
          </Card>

          <Card title="Style" size="small" style={{ marginBottom: 16 }}>
            {isNode ? (
                <>
                    <Form.Item label="Fill Color" name="fill">
                        <ColorPicker showText />
                    </Form.Item>
                    <Form.Item label="Border Color" name="stroke">
                        <ColorPicker showText />
                    </Form.Item>
                    <Form.Item label="Size" name="size">
                        <InputNumber min={10} max={100} />
                    </Form.Item>
                    <Form.Item label="Icon Text" name="iconText">
                        <Input placeholder="e.g. A" maxLength={1} />
                    </Form.Item>
                </>
            ) : (
                <>
                    <Form.Item label="Color" name="stroke">
                        <ColorPicker showText />
                    </Form.Item>
                    <Form.Item label="Line Width" name="lineWidth">
                        <InputNumber min={1} max={10} />
                    </Form.Item>
                    <Form.Item label="Line Type" name="lineDash">
                        <Select options={[
                            { value: 'solid', label: 'Solid' },
                            { value: 'dashed', label: 'Dashed' },
                        ]} />
                    </Form.Item>
                </>
            )}
          </Card>
        </Form>
      </div>
    </div>
  );
};

export default PropertyPanel;
