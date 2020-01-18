import Vue from 'vue';
import { SOURCE_OF_BUSINESS, WHAT_IF } from '@conjointly/turf-analysis-ui/templates/new/components/simulations/worksheet-types';
import { SET } from '@conjointly/turf-analysis-ui/templates/new/components/simulations/store/mutation-types';

const extractors = {
  getShowRelativeAvailable: (scenario) => scenario.concepts && scenario.concepts.filter(
    (concept) => concept.relativeAvailability != 0 && concept.relativeAvailability != 1,
  ).length > 0
        || (scenario.none && scenario.none.relativeAvailability != 0 && scenario.none.relativeAvailability != 1),

  getShowAdvancedSettings: (scenario, showRelativeAvailable) => scenario.productType !== 'sop' || showRelativeAvailable || scenario.segment != 0,
};

const setter = (state) => (scenario, sourceScenarioId) => {
  const showRelativeAvailable = extractors.getShowRelativeAvailable(scenario);
  const showAdvancedSettings = extractors.getShowAdvancedSettings(scenario, showRelativeAvailable);
  Vue.set(
    state.scenariosShowAdvancedSettings,
    scenario.id,
    (sourceScenarioId && state.scenariosShowAdvancedSettings[sourceScenarioId]) || showAdvancedSettings,
  );
};

export default {
  state: {
    scenariosShowAdvancedSettings: {},
  },
  mutations: {
    [SET]: (state, { worksheets }) => {
      worksheets.filter((w) => w.type === WHAT_IF).map((worksheet) => worksheet.scenarios.map((scenario) => {
        setter(state)(scenario);
      }));
      worksheets.filter((w) => w.type === SOURCE_OF_BUSINESS).map((worksheet) => worksheet.scenarios.map((scenario) => {
        state.scenariosShowAdvancedSettings[scenario.id] = true;
      }));
    },
    SET_SHOW_ADVANCED_SETTINGS: (state, { scenarioId, value }) => {
      Vue.set(state.scenariosShowAdvancedSettings, scenarioId, value);
    },
    SET_SHOW_ADVANCED_SETTINGS_FOR_ALL_SCENARIOS: (state, value) => {
      for (const prop in state.scenariosShowAdvancedSettings) {
        if (state.scenariosShowAdvancedSettings.hasOwnProperty(prop)) {
          state.scenariosShowAdvancedSettings[prop] = value;
        }
      }
    },
    ADD_SCENARIO_TO_WORKSHEET: (state, { scenario, sourceScenarioId }) => {
      setter(state)(scenario, sourceScenarioId);
    },
  },
  getters: {
    getShowRelativeAvailable: () => (scenario) => extractors.getShowRelativeAvailable(scenario),
    getShowAdvancedSettings: (state, getters) => (scenario) => state.scenariosShowAdvancedSettings[scenario.id]
            || extractors.getShowAdvancedSettings(scenario, getters.getShowRelativeAvailable(scenario)),
  },
};
