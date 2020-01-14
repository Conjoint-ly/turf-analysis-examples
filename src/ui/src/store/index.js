import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    title: '',
    calculations: [],
  },
  getters: {
    title: ({ title }) => title,
    calculations: ({ calculations }) => calculations,
  },
  mutations: {
    setTitle: (state, title) => {
      state.title = title;
    },
    addCalculation(state, calculation) {
      state.calculations.push(calculation);
    },
  },
  actions: {
  },
  modules: {
  },
});

const storageStateKey = 'state';
const modulesToStore = ['calculations'];

modulesToStore.forEach((module) => {
  store.watch((
    state,
  ) => module.split('.').reduce(
    (parent, key) => parent[key], state,
  ), (value) => {
    const currentState = JSON.parse(localStorage.getItem(storageStateKey) || '{}');
    currentState[module] = value;
    localStorage.setItem(storageStateKey, JSON.stringify(currentState));
  });
});

export default store;
