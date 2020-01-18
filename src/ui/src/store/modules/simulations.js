import $ from 'jquery';
import Vue from 'vue';
import { SOURCE_OF_BUSINESS, WHAT_IF } from '@conjointly/turf-analysis-ui/templates/new/components/simulations/worksheet-types';
import analysis from '@conjointly/turf-analysis-ui/templates/new/services/analysis';

export default {
  state: {
    processingFlags: [],
    simulationQueue: [],
    experimentId: null,
    experimentType: null,
    csrfToken: null,
    simulation: null,
    priceObject: null,
    // only for BTPO?
    priceObjects: null,
  },
  mutations: {
    SET: (state, {
      experimentId, experimentType, csrfToken, priceObject,
    }) => {
      state.experimentId = experimentId;
      state.experimentType = experimentType;
      state.csrfToken = csrfToken;
      if (priceObject && priceObject.hasOwnProperty('min')) state.priceObject = priceObject;
      else state.priceObjects = priceObject;
    },
    SET_PROCESSING: (state, { worksheetId, value }) => {
      Vue.set(state.processingFlags, worksheetId, value);
    },
    PUSH_TO_SIMULATION_QUEUE: (state, simulation) => {
      state.simulationQueue.push(simulation);
    },
    FETCH_SIMULATION: (state) => {
      state.simulation = state.simulationQueue.shift();
    },
  },
  actions: {
    simulationQueueIterator: ({ state, commit, dispatch }) => new Promise((resolve) => {
      if (!state.simulationQueue.length) {
        resolve();
      } else {
        commit('FETCH_SIMULATION');
        state.simulation().then(() => {
          dispatch('simulationQueueIterator').then(resolve);
        });
      }
    }),
    simulationQueueRun: ({ state, dispatch }) => {
      if (!state.simulationQueueStarted) {
        state.simulationQueueStarted = true;
        return dispatch('simulationQueueIterator').then(() => {
          state.simulationQueueStarted = false;
        });
      }
    },
    runSegregate: ({ state, getters }, { worksheetId, scenarioId }) => {
      const scenarioData = getters.getScenarioDataForSegregate({ worksheetId, scenarioId });
      return new Promise((resolve, reject) => analysis.segregate(state.experimentId, scenarioData, state.csrfToken).then((data) => resolve(data)).catch((error) => reject(error)));
    },
    checkDirtyAndRunSimulation: ({ dispatch, getters }, worksheetId) => new Promise((resolve) => {
      if (!getters.isDirty(worksheetId)) {
        resolve();
      } else {
        const worksheetById = getters.getWorksheetById(worksheetId);
        if (worksheetById.type === WHAT_IF) {
          return dispatch('runSimulation', worksheetId).then(resolve);
        }
        if (worksheetById.type === SOURCE_OF_BUSINESS) {
          return Promise.all(
            getters.getDirtyWorksheetIdsOfSourceOfBusiness(worksheetId).map((dirtyWorksheetId) => dispatch('runSimulation', dirtyWorksheetId)),
          ).then(resolve);
        }
      }
    }),
    runSourceOfBusinessSimulation: ({ dispatch, getters }, worksheetId) => Promise.all(
      getters.getDirtyWorksheetIdsOfSourceOfBusiness(worksheetId).map((dirtyWorksheetId) => dispatch('runSimulation', dirtyWorksheetId)),
    ),
    runSimulation: ({
      state, commit, dispatch, getters,
    }, worksheetId) => {
      commit('SET_PROCESSING', { worksheetId, value: true });
      const data = getters.getWorksheetData(worksheetId);
      data.csrf_token = state.csrfToken;

      commit(
        'PUSH_TO_SIMULATION_QUEUE',
        () => new Promise((resolve) => {
          $.post(
            `/reports/${state.experimentId}/run-simulation/`,
            data,
            (response) => {
              window.clearNotifierTopic('run-simulation');
              dispatch('setWorksheetData', {
                worksheetId,
                worksheetData: response,
              });
            },
            'json',
          ).fail((jqXHR) => {
            window.newNotifier({
              topic: 'run-simulation',
              type: 'danger',
              message: jqXHR.responseText,
            });
          }).always(() => {
            commit('SET_PROCESSING', { worksheetId, value: false });
            resolve();
          });
        }),
      );
      return dispatch('simulationQueueRun');
    },
  },
  getters: {
    getPriceObject: (state) => (brand) => {
      if (brand && state.priceObjects) {
        return state.priceObjects[brand] || null;
      }
      return state.priceObject;
    },
    hasPriceObject: (state) => !!(state.priceObjects || state.priceObject),
    getProcessing: (state, getters) => (worksheetId) => {
      const worksheetById = getters.getWorksheetById(worksheetId);
      if (worksheetById.type === WHAT_IF) {
        return state.processingFlags[worksheetId] || false;
      }
      if (worksheetById.type === SOURCE_OF_BUSINESS) {
        return getters.getDirtyWorksheetIdsOfSourceOfBusiness(worksheetId).map((worksheetId) => state.processingFlags[worksheetId] || false).reduce((processing, worksheetProcessing) => processing || worksheetProcessing, false);
      }
    },
  },
};
