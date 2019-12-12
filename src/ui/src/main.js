import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import './plugins/turf-ui';

Vue.config.productionTip = process.env.NODE_ENV === 'development';

new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
});
