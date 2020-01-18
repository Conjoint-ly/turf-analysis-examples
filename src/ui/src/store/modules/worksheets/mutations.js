import Vue from 'vue';
import { SOURCE_OF_BUSINESS, WHAT_IF } from '@conjointly/turf-analysis-ui/templates/new/components/simulations/worksheet-types';
import cloneDeep from 'lodash/cloneDeep';
import generate from '@conjointly/turf-analysis-ui/templates/new/components/simulations/utils/generate';
import helpers from '@conjointly/turf-analysis-ui/templates/new/components/simulations/store/modules/worksheets/helpers';
import { ADD_SOURCE_OF_BUSINESS_WORKSHEET, SET } from '@conjointly/turf-analysis-ui/templates/new/components/simulations/store/mutation-types';
import format from '@conjointly/turf-analysis-ui/templates/new/components/simulations/utils/format';
import { getBrandAttribute, getPriceAttribute } from '@conjointly/turf-analysis-ui/templates/new/components/simulations/store/modules/worksheets/getters';

/**
 * Если с сервера прилетели цена в формате A\d+L\d+ и priceObject,
 * то необходимо преобразовать цену в формат числа,
 * также если цена уже в формате числа, то ничего не делаем
 *
 * @param state
 * @param concept
 */
function fixConceptPrices(state, concept) {
  const priceAttribute = getPriceAttribute(state);
  let priceLevel;
  for (const attribute in concept.attributes) {
    if (concept.attributes.hasOwnProperty(attribute) && attribute === priceAttribute.value) {
      if (/^A\d+L\d+$/.test(concept.attributes[attribute])) {
        // Получаем уровень
        priceLevel = priceAttribute.levels.filter(
          (priceLevel) => priceLevel.value == concept.attributes[attribute],
        )[0];
        concept.attributes[attribute] = priceLevel.number;
      } else if (!format.isNumeric(concept.attributes[attribute])) {
        /*
                 * Фикс для уже сломанных уровней - пробуем найти по отформатированному имени уровня,
                 * Если не получается, то берем первый
                 */
        priceLevel = priceAttribute.levels.filter(
          (priceLevel) => format.reformatMoney(priceLevel.name) == concept.attributes[attribute],
        )[0];
        concept.attributes[attribute] = priceLevel ? priceLevel.number : priceAttribute.levels[0].number;
      }
    }
  }
}

export default {
  [SET]: (state, {
    worksheets, attributes, priceObject, segments, experimentType, applicability,
  }) => {
    state.attributes = attributes.map((attribute) => ({
      name: attribute.name_short,
      value: `A${attribute.AseqNum}`,
      type: attribute.type,
      levels: attribute.levels.map((level) => ({
        group: level.group,
        name: level.name_short,
        value: `A${level.AseqNum}L${level.LseqNum}`,
        number: level.value,
      })),
    }));
    if (experimentType === 'brandPriceTradeOff') {
      const aSeqNum = state.btpoAfterAdceptASeqNum;
      state.attributes.push({
        name: 'Adcept',
        value: `A${aSeqNum}`,
        type: 'fake',
        levels: [
          {
            name: 'No adcept',
            value: `A${aSeqNum}L1`,
            number: 0,
          },
          {
            name: 'After adcept',
            value: `A${aSeqNum}L2`,
            number: 1,
          },
        ],
      });
    }
    if (applicability.hasOwnProperty('version') && applicability.version === '1.0') {
      state.isVersion1 = true;
      for (const brand in applicability.table) {
        if (applicability.table.hasOwnProperty(brand)) {
          for (let i = 0; i < applicability.table[brand].length; i++) {
            state.applicability.push([brand, applicability.table[brand][i]]);
            if (experimentType === 'brandPriceTradeOff') {
              const brandAttribute = getBrandAttribute(state);
              if (
                brandAttribute
                                && brandAttribute.levels.filter(
                                  (l) => l.group === 'npd-ours' && l.value === brand,
                                ).length === 0
              ) {
                const aSeqNum = state.btpoAfterAdceptASeqNum;
                state.applicability.push([brand, `A${aSeqNum}L2`]);
              }
            }
          }
        }
      }
    } else {
      state.applicability = applicability;
    }
    state.worksheets = worksheets.map((worksheet) => {
      // add default `what-if` type
      if (!worksheet.type) {
        worksheet.type = WHAT_IF;
      }
      if (worksheet.type === WHAT_IF) {
        if (typeof worksheet.id === 'number') {
          worksheet.id = worksheet.id.toString();
        }
        // Convert all strings to booleans
        worksheet.scenarios.forEach((scenario) => {
          if (typeof scenario.id === 'number') {
            scenario.id = scenario.id.toString();
          }
          if (typeof scenario.price === 'string' && scenario.price.length === 0) {
            scenario.price = null;
          }
          if (typeof scenario.show === 'string') {
            scenario.show = scenario.show === 'true';
          }
          scenario.concepts.forEach((concept) => {
            if (typeof concept.id === 'number') {
              concept.id = concept.id.toString();
            }
            if (typeof concept.show === 'string') {
              concept.show = concept.show === 'true';
            }
            /*

                         */
            if (priceObject) {
              fixConceptPrices(state, concept);
            }

            // for non-set attributes try to set first value of attribute's levels
            // it will be fixed later in store's `init` action to applicable value
            for (let i = 0; i < state.attributes.length; i++) {
              if (undefined === concept.attributes[state.attributes[i].value]) {
                Vue.set(
                  concept.attributes,
                  state.attributes[i].value,
                  state.attributes[i].levels[0].value,
                );
              }
            }
          });
          if (typeof scenario.segment === 'string') {
            scenario.segment = parseInt(scenario.segment) || 0;
          }
          if (!segments.map((s) => s.id).includes(scenario.segment)) {
            scenario.segment = 0;
          }
          if (scenario.none && typeof scenario.none.show === 'string') {
            scenario.none.show = scenario.none.show === 'true';
          }
        });
        if (!worksheet.hasOwnProperty('revenues')) {
          worksheet.revenues = {};
        }
      }
      if (worksheet.type === SOURCE_OF_BUSINESS) {
        worksheet.scenarios.forEach((scenario) => helpers.processSourceOfBusinessScenario(worksheets, scenario));
      }
      return worksheet;
    });
    state.savedWorksheets = cloneDeep(state.worksheets);
  },
  [ADD_SOURCE_OF_BUSINESS_WORKSHEET]: (
    state,
    {
      name, scenarioName, newWorksheetId, newScenario, baselineWorksheetId, baselineScenario,
    },
  ) => {
    state.worksheets.push(
      {
        id: generate.generateUniqueId(),
        type: SOURCE_OF_BUSINESS,
        name,
        scenarios: [
          {
            name: scenarioName,
            newWorksheetId,
            newScenario,
            newScenarioId: newScenario.id,
            baselineWorksheetId,
            baselineScenario,
            baselineScenarioId: baselineScenario.id,
          },
        ],
      },
    );
  },
  CHANGE_SOURCE_OF_BUSINESS_SCENARIO: (
    state,
    {
      scenario, newWorksheetId, newScenario, baselineWorksheetId, baselineScenario,
    },
  ) => {
    Object.assign(scenario, {
      newWorksheetId,
      newScenario,
      newScenarioId: newScenario && newScenario.id,
      baselineWorksheetId,
      baselineScenario,
      baselineScenarioId: baselineScenario && baselineScenario.id,
    });
  },
  // todo increase performance???
  SET_SCENARIO_FROM_WORKSHEET_DATA: (state, { worksheet, scenarioIndex, _scenario }) => {
    const scenario = worksheet && worksheet.scenarios[scenarioIndex];
    if (!scenario) return;
    scenario.price = _scenario.price;
    _scenario.concepts.forEach((_concept, j) => {
      const concept = scenario.concepts[j];
      concept.adjustedPreferenceShare = _concept.adjustedPreferenceShare;
      concept.simulatedPreferenceShare = _concept.simulatedPreferenceShare;
      concept.revenue = _concept.revenue;
      // applied from source concept
      const { actualMarketShare } = concept;
      concept.actualMarketShare = actualMarketShare || concept.simulatedPreferenceShare;
      concept.relativeAvailability = actualMarketShare ? concept.relativeAvailability : 0;
    });
    const _none = _scenario.none;
    if (_none) {
      const { none } = scenario;
      none.adjustedPreferenceShare = _none.adjustedPreferenceShare;
      none.simulatedPreferenceShare = _none.simulatedPreferenceShare;
      // applied from source concept
      const { actualMarketShare } = none;
      none.actualMarketShare = actualMarketShare || none.simulatedPreferenceShare;
      none.relativeAvailability = actualMarketShare ? none.relativeAvailability : 0;
    }
  },
  SET_CONCEPT_COLOR: (state, { concept, color }) => {
    Vue.set(concept, 'color', color);
  },
  HIDE_CONCEPT: (state, { color, worksheet }) => {
    state.applyHideFlag = false;
    // Get only shown scenarios
    const scenarios = worksheet.scenarios.filter((scenario) => scenario.show);
    // Filter all concepts with the same color
    scenarios.forEach((scenario) => {
      let show = false;
      scenario.concepts.forEach((concept) => {
        if (concept.color.toUpperCase() === color.toUpperCase() && concept.show) {
          concept.show = false;
          state.applyHideFlag = true;
        }
        if (concept.show) {
          show = true;
        }
      });
      // Check none of the above
      if (scenario.none) {
        if (scenario.none.color.toUpperCase() === color.toUpperCase() && scenario.none.show) {
          scenario.none.show = false;
          state.applyHideFlag = true;
        }
        if (scenario.none.show) {
          show = true;
        }
      }
      // Update scenario show if it needs
      if (scenario.show !== show) scenario.show = show;
    });
  },
  SHOW_ALL_CONCEPTS: (state, worksheetId) => {
    const { scenarios } = state.worksheets.find((w) => w.id === worksheetId);
    scenarios.forEach((scenario) => {
      if (!scenario.show) scenario.show = true;
      scenario.concepts.forEach((concept) => {
        if (!concept.show) concept.show = true;
      });
      if (scenario.none && !scenario.none.show) scenario.none.show = true;
    });
  },
  SET_HAS_REVENUE_DATA: (state, { worksheetId, hasRevenue }) => {
    Vue.set(state.worksheetsHasRevenue, worksheetId, hasRevenue);
  },
  SET_ELASTICITY_CHART: (state, { worksheetId, elasticityChart }) => {
    Vue.set(state.worksheetsElasticityChart, worksheetId, elasticityChart);
  },
  SET_ELASTICITY_CHART_VARIABLE_CONCEPT: (state, { worksheetId, elasticityChartVariableConcept }) => {
    Vue.set(state.worksheetsElasticityChartVariableConcept, worksheetId, elasticityChartVariableConcept);
  },
  SET_WORKSHEET_HASH: (state, { worksheetId, hash }) => {
    Vue.set(state.hashes, worksheetId, hash);
  },
  SET_WORKSHEET_NAME: (state, { worksheet, name }) => {
    Vue.set(worksheet, 'name', name);
  },
  ADD_WORKSHEET: (state, worksheet) => {
    state.worksheets.push(worksheet);
  },
  DELETE_WORKSHEET: (state, worksheetIndex) => {
    Vue.delete(state.worksheets, worksheetIndex);
  },
  SET_CURRENT_WORKSHEET: (state, worksheetIndex) => {
    state.currentWorksheetIndex = worksheetIndex;
  },
  SET_CURRENT_SCENARIO: (state, scenarioIndex) => {
    Vue.set(state.currentScenarioIndexes, state.currentWorksheetIndex, scenarioIndex);
  },
  ADD_SCENARIO_TO_WORKSHEET: (state, { worksheetId, scenario }) => {
    state.worksheets.find((w) => w.id === worksheetId).scenarios.push(scenario);
  },
  DELETE_EXCEPT_SCENARIO: (state, { worksheet, scenarioIndex }) => {
    if (scenarioIndex === -1) return;
    const deletedScenarios = worksheet.scenarios.splice(0, scenarioIndex);
    worksheet.scenarios.splice(scenarioIndex - deletedScenarios.length + 1);
  },
  ADD_CONCEPT: (state, { concepts, concept }) => {
    concepts.push(concept);
  },
  DELETE_SCENARIO: (state, { scenarios, scenarioIndex }) => {
    Vue.delete(scenarios, scenarioIndex);
  },
  DELETE_CONCEPT: (state, { concepts, conceptIndex }) => {
    Vue.delete(concepts, conceptIndex);
  },
  UPDATE_WORKSHEETS: (state, { worksheets }) => {
    state.worksheets = worksheets;
  },
  UPDATE_SCENARIOS: (state, { worksheet, scenarios }) => {
    worksheet.scenarios = scenarios;
  },
  UPDATE_CONCEPTS: (state, { scenario, concepts }) => {
    scenario.concepts = concepts;
  },
  SET_SCENARIO_FIELD: (state, {
    worksheetId, scenarioId, field, value,
  }) => {
    Vue.set(
      state.worksheets.find((w) => w.id === worksheetId).scenarios.find((s) => s.id === scenarioId),
      field,
      value,
    );
  },
  SET_SCENARIO_NAME: (state, { scenario, name }) => {
    Vue.set(scenario, 'name', name);
  },
  ADJUST_SCENARIOS_SETTINGS: (state, { worksheetId, scenarioId, field }) => {
    const worksheet = state.worksheets.find((w) => w.id === worksheetId);
    const sourceScenario = worksheet.scenarios.find((s) => s.id === scenarioId);
    const value = sourceScenario[field];
    worksheet.scenarios.map((s) => Vue.set(s, field, value));
  },
  SORT_SCENARIOS_BY_PRICE: (state, worksheetId) => {
    state.worksheets.find((w) => w.id === worksheetId).scenarios.sort((a, b) => a.price - b.price);
  },
  SAVE_SAVED_WORKSHEETS: (state) => {
    state.savedWorksheets = cloneDeep(state.worksheets);
  },
  SET_SAVED: (state, saved) => {
    state.saved = saved;
  },
  SET_CONCEPT_NAME: (state, { concept, name }) => {
    Vue.set(concept, 'name', name);
  },
  SET_CONCEPT_ATTRIBUTE_VALUE: (state, { attributes, attribute, value }) => {
    Vue.set(attributes, attribute, value);
  },
  SYNC_SCENARIO: (state, { scenario, newScenario }) => {
    newScenario.concepts.forEach((concept, i) => {
      scenario.concepts[i].actualMarketShare = concept.actualMarketShare;
      scenario.concepts[i].relativeAvailability = concept.relativeAvailability;
    });
    if (scenario.none) {
      scenario.none.actualMarketShare = newScenario.none.actualMarketShare;
      scenario.none.relativeAvailability = newScenario.none.relativeAvailability;
    }
  },
  RESET_CONCEPTS_AVAILABILITY: (state, scenario) => {
    scenario.concepts.forEach((concept) => {
      concept.actualMarketShare = concept.simulatedPreferenceShare;
      concept.relativeAvailability = 0;
    });
    if (scenario.none) {
      scenario.none.actualMarketShare = scenario.none.simulatedPreferenceShare;
      scenario.none.relativeAvailability = 0;
    }
  },
  ADD_REVENUE_TO_WORKSHEET: (state, { worksheetId, revenue: { title, xAxisTitle, formulas } }) => {
    const id = generate.generateUniqueId();
    const worksheet = state.worksheets.find((w) => w.id === worksheetId);
    Vue.set(worksheet.revenues, id, {
      id, title, xAxisTitle, formulas,
    });
    Vue.set(state.currentRevenueIds, worksheetId, id);
  },
  CHANGE_REVENUE: (state, {
    worksheetId, revenueId, title, xAxisTitle, formulas,
  }) => {
    const worksheet = state.worksheets.find((w) => w.id === worksheetId);
    Vue.set(worksheet.revenues, revenueId, {
      id: revenueId, title, xAxisTitle, formulas,
    });
  },
  REMOVE_REVENUE_FROM_WORKSHEET: (state, { worksheetId, revenueId }) => {
    const worksheet = state.worksheets.find((w) => w.id === worksheetId);
    Vue.delete(worksheet.revenues, revenueId);
  },
  SET_CURRENT_REVENUE_ID: (state, { worksheetId, revenueId }) => {
    Vue.set(state.currentRevenueIds, worksheetId, revenueId);
  },
};
