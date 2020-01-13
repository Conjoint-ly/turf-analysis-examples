import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    title: '',
  },
  getters: {
    title: ({ title }) => title,
  },
  mutations: {
    setTitle: (state, title) => {
      state.title = title;
    },
  },
  actions: {
  },
  modules: {
  },
});
