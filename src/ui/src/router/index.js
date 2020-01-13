import Vue from 'vue';
import VueRouter from 'vue-router';
import PageIndex from '@conjointly/turf-analysis-examples/src/ui/src/pages/index';
import PageCalculationsId from '@conjointly/turf-analysis-examples/src/ui/src/pages/calculations/_id';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'index',
    component: PageIndex,
  },
  {
    path: '/calculations/:id',
    name: 'calculations-id',
    component: PageCalculationsId,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
