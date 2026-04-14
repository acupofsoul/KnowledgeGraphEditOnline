export interface IGraphNode {
  id: string;
  style?: {
    x?: number;
    y?: number;
    labelText?: string;
    fill?: string;
    stroke?: string;
    size?: number;
    lineWidth?: number;
    lineDash?: number[];
    iconText?: string;
    iconFontSize?: number;
    iconFill?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface IGraphEdge {
  id: string;
  source: string;
  target: string;
  style?: {
    labelText?: string;
    stroke?: string;
    lineWidth?: number;
    lineDash?: number[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface IGraphData {
  nodes: IGraphNode[];
  edges: IGraphEdge[];
}
