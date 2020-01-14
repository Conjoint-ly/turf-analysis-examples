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
    calculationsMap: ({ calculations }) => calculations.reduce((prev, calculation) => ({
      ...prev,
      [calculation.id]: calculation,
    }), {}),
  },
  mutations: {
    setTitle: (state, title) => {
      state.title = title;
    },
    addCalculation(state, calculation) {
      state.calculations.push(calculation);
    },
    updateCalculation(state, calculation) {
      const index = state.calculations.findIndex(({ id }) => id === calculation.id);

      if (index > -1) {
        Object.assign(
          state.calculations.find(({ id }) => id === calculation.id),
          calculation,
        );
      }
    },
    restoreModule(state, { module, value }) {
      const split = module.split('.');
      const key = split.pop();
      const target = split.reduce((prev, cur) => prev[cur], state);

      target[key] = value;
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
  const currentState = JSON.parse(localStorage.getItem(storageStateKey) || '{}');
  if (module in currentState) {
    store.commit('restoreModule', { module, value: currentState[module] });
  }

  store.watch((
    state,
  ) => module.split('.').reduce(
    (parent, key) => parent[key], state,
  ), (value) => {
    const curState = JSON.parse(localStorage.getItem(storageStateKey) || '{}');
    curState[module] = value;
    localStorage.setItem(storageStateKey, JSON.stringify(curState));
  }, {
    immediate: true,
    deep: true,
  });
});

export default store;
