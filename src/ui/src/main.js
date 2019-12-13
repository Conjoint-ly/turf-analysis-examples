import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import './plugins/turf-ui';
import './plugins/turf-worker';

Vue.config.productionTip = process.env.NODE_ENV === 'development';

window.app = new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
});
