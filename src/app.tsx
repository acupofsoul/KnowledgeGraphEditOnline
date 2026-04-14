import { RunTimeLayoutConfig } from '@umijs/max';

export const layout: RunTimeLayoutConfig = () => {
  return {
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    menu: {
      locale: false,
    },
    layout: 'mix',
    fixedHeader: true,
    fixSiderbar: true,
    contentWidth: 'Fluid',
    childrenRender: (children) => {
        return (
            <div style={{ minWidth: 1200, margin: '0 auto', height: '100%' }}>
                {children}
            </div>
        )
    }
  };
};
