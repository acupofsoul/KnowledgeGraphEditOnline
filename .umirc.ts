import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'KG Editor',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      name: '本体编辑',
      path: '/ontology',
      component: './Ontology',
    },
    {
      name: '实体编辑',
      path: '/entity',
      component: './Entity',
    },
  ],
  npmClient: 'npm',
});
