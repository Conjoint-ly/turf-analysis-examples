import Vue from 'vue';
import Vuex from 'vuex';

import { WHAT_IF } from '@conjointly/turf-analysis-ui/templates/new/components/simulations/worksheet-types';
import VuexValidator from '@conjointly/turf-analysis-ui/templates/new/plugins/vuex-validator';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import worksheets from './modules/worksheets';
import scenarios from './modules/scenarios';
import segments from './modules/segments';
import simulations from './modules/simulations';
import validations from './modules/validations';

Vue.use(Vuex);

const worksheetsWatcher = (store) => {
  store.subscribe((mutation, state) => {
    if (mutation.type === 'SET_SAVED') return;
    // fixme: hack to decrease apply clone worksheets
    if (
    // trigger only for worksheets mutations or revenues
      store._modules.root._rawModule.modules.worksheets.mutations.hasOwnProperty(mutation.type)
    ) {
      const nextWorksheets = cloneDeep(state.worksheets.worksheets);
      if (!isEqual(state.worksheets.savedWorksheets, nextWorksheets)) {
        store.commit('SET_SAVED', false);
      } else {
        store.commit('SET_SAVED', true);
      }
    }
  });
};

const options = {
  plugins: [
    worksheetsWatcher,
  ],
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
    init({ commit, state, dispatch }, payload) {
      commit('SET', payload);
      state.worksheets.worksheets.filter((w) => w.type === WHAT_IF).forEach((w) => {
        w.scenarios.forEach((s) => {
          s.concepts.forEach((concept) => {
            for (let i = 0; i < state.worksheets.attributes.length; i++) {
              const attribute = state.worksheets.attributes[i];
              if (concept.attributes.hasOwnProperty(attribute.value)) {
                // fixme this used side-effect of `checkApplicability` for set applicable value
                //  to concept's attribute.
                dispatch('checkApplicability', {
                  concept,
                  attribute,
                  value: concept.attributes[attribute.value],
                });
              }
            }
          });
        });
      });

      state.worksheets.worksheets.filter((w) => w.type === WHAT_IF).forEach((worksheet) => dispatch('runSimulation', worksheet.id));
    },
  },
  modules: {
    worksheets,
    scenarios,
    segments,
    simulations,
    validations,
  },
};

Vue.use(VuexValidator, { store: options });
const store = new Vuex.Store(options);

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
