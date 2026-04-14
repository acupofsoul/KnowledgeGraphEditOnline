import React from 'react';
import { Badge } from 'antd';
import { useGraphStore } from '../../stores/graphStore';
import { useUIStore } from '../../stores/uiStore';
import { useValidationStore } from '../../stores/validationStore';
import './index.less';

const StatusBar: React.FC = () => {
  // 状态管理
  const { getNodeCount, getEdgeCount } = useGraphStore();
  const { config } = useUIStore();
  const { getErrorCount, getWarningCount, getInfoCount } = useValidationStore();
  
  // 获取统计信息
  const nodeCount = getNodeCount();
  const edgeCount = getEdgeCount();
  const errorCount = getErrorCount();
  const warningCount = getWarningCount();
  const infoCount = getInfoCount();
  const zoomLevel = Math.round(config.canvas.zoom * 100);
  
  return (
    <div className="status-bar">
      <div className="status-left">
        <span className="status-item">
          节点: <strong>{nodeCount}</strong>
        </span>
        <span className="status-item">
          边: <strong>{edgeCount}</strong>
        </span>
      </div>
      
      <div className="status-center">
        <span className="status-item">
          缩放: <strong>{zoomLevel}%</strong>
        </span>
      </div>
      
      <div className="status-right">
        {errorCount > 0 && (
          <Badge count={errorCount} style={{ backgroundColor: '#ff4d4f' }} />
        )}
        {warningCount > 0 && (
          <Badge count={warningCount} style={{ backgroundColor: '#faad14' }} />
        )}
        {infoCount > 0 && (
          <Badge count={infoCount} style={{ backgroundColor: '#1890ff' }} />
        )}
      </div>
    </div>
  );
};

export default StatusBar;
