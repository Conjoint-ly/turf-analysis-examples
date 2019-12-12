import Vue from 'vue';
import VueRouter from 'vue-router';
import PageIndex from '../pages/Index';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'index',
    component: PageIndex,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
