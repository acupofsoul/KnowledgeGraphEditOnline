import React from 'react';
import { Space, Button, Tooltip, Select, Divider, Upload } from 'antd';
import { 
  ZoomInOutlined, 
  ZoomOutOutlined, 
  CompressOutlined, 
  GatewayOutlined,
  AppstoreOutlined,
  BranchesOutlined,
  DeploymentUnitOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  UndoOutlined,
  RedoOutlined
} from '@ant-design/icons';

interface GraphToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  layout: string;
  onLayoutChange: (layout: string) => void;
  onLayoutExecute: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const GraphToolbar: React.FC<GraphToolbarProps> = ({ 
  onZoomIn, 
  onZoomOut, 
  onFitView, 
  layout,
  onLayoutChange,
  onLayoutExecute,
  onExport,
  onImport,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  return (
    <div style={{ 
      position: 'absolute', 
      top: 16, 
      left: 16, 
      zIndex: 10, 
      background: 'rgba(255, 255, 255, 0.9)', 
      padding: '8px 12px', 
      borderRadius: '8px', 
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      backdropFilter: 'blur(4px)'
    }}>
      <Space.Compact>
        <Tooltip title="Undo">
          <Button icon={<UndoOutlined />} onClick={onUndo} disabled={!canUndo} />
        </Tooltip>
        <Tooltip title="Redo">
          <Button icon={<RedoOutlined />} onClick={onRedo} disabled={!canRedo} />
        </Tooltip>
      </Space.Compact>

      <Divider type="vertical" />

      <Space.Compact>
        <Tooltip title="Zoom In">
          <Button icon={<ZoomInOutlined />} onClick={onZoomIn} />
        </Tooltip>
        <Tooltip title="Zoom Out">
          <Button icon={<ZoomOutOutlined />} onClick={onZoomOut} />
        </Tooltip>
        <Tooltip title="Fit View">
          <Button icon={<CompressOutlined />} onClick={onFitView} />
        </Tooltip>
      </Space.Compact>

      <Divider type="vertical" />

      <Select 
        value={layout} 
        onChange={onLayoutChange} 
        style={{ width: 120 }}
        options={[
          { value: 'dagre', label: <span><GatewayOutlined /> Dagre</span> },
          { value: 'grid', label: <span><AppstoreOutlined /> Grid</span> },
          { value: 'circular', label: <span><BranchesOutlined /> Circular</span> },
          { value: 'force', label: <span><DeploymentUnitOutlined /> Force</span> },
        ]}
      />
      
      <Tooltip title="Re-Layout">
          <Button icon={<ReloadOutlined />} onClick={onLayoutExecute} />
      </Tooltip>

      <Divider type="vertical" />

      <Tooltip title="Export JSON">
          <Button icon={<DownloadOutlined />} onClick={onExport} />
      </Tooltip>
      
      <Tooltip title="Import JSON">
          <Upload 
            accept=".json" 
            showUploadList={false}
            beforeUpload={(file) => {
                onImport(file);
                return false;
            }}
          >
            <Button icon={<UploadOutlined />} />
          </Upload>
      </Tooltip>
    </div>
  );
};

export default GraphToolbar;
