import Vue from 'vue';
import Validator from 'simple-vue-validator';
import VueInputAutowidth from 'vue-input-autowidth';
import store from '@/store';
import router from '@/router';

import '@/plugins/turf-ui';
import '@/plugins/turf-worker';
import App from '@/App';
import 'jquery.are-you-sure';

import '@conjointly/turf-analysis-ui/templates/new/services/userconfig';

Vue.config.productionTip = process.env.NODE_ENV === 'development';

Vue.use(Validator);
Vue.use(VueInputAutowidth);

window.app = new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
});
