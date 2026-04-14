import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    {
      path: '/',
      component: '@/pages/editor/index',
    },
  ],
  fastRefresh: {},
  mfsu: false,
  webpack5: {},
  cssModules: {
    localIdentName: '[local]--[hash:base64:5]',
  },
  theme: {
    token: {
      colorPrimary: '#1890ff',
      colorLink: '#1890ff',
      colorLinkHover: '#40a9ff',
      colorLinkActive: '#096dd9',
      colorText: '#262626',
      colorTextSecondary: '#595959',
      colorBorder: '#e8e8e8',
      colorBorderSecondary: '#f0f0f0',
      borderRadius: 4,
    },
  },
});