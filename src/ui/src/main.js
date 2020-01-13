import Vue from 'vue';
import store from '@/store';
import router from '@/router';

import '@/plugins/turf-ui';
import '@/plugins/turf-worker';
import App from '@/App';

Vue.config.productionTip = process.env.NODE_ENV === 'development';

window.app = new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
});
