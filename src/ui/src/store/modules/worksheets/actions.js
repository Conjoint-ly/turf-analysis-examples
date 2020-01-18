import generate from '@conjointly/turf-analysis-ui/templates/new/components/simulations/utils/generate';
import { SOURCE_OF_BUSINESS } from '@conjointly/turf-analysis-ui/templates/new/components/simulations/worksheet-types';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import $ from 'jquery';
import helpers from '@conjointly/turf-analysis-ui/templates/new/components/simulations/store/modules/worksheets/helpers';
import { ADD_SOURCE_OF_BUSINESS_WORKSHEET } from '@conjointly/turf-analysis-ui/templates/new/components/simulations/store/mutation-types';

export function copySingleAttributeToNames({ commit, getters }, scenario) {
  return new Promise((resolve) => {
    scenario.concepts.forEach((concept) => {
      const singleAttributeForConcept = getters.getSingleAttributeForConcept(concept);
      singleAttributeForConcept && commit('SET_CONCEPT_NAME', { concept, name: singleAttributeForConcept });
    });
    resolve();
  });
}

export function copyBrandsToNames({ commit, getters }, scenario) {
  return new Promise((resolve) => {
    scenario.concepts.forEach((concept) => {
      const brandForConcept = getters.getBrandForConcept(concept);
      brandForConcept && commit('SET_CONCEPT_NAME', { concept, name: brandForConcept });
    });
    resolve();
  });
}

export function saveWorksheets(
  {
    dispatch,
    commit,
    state: { worksheets },
    rootState: {
      simulations: { csrfToken, experimentId },
    },
  },
  $btn,
) {
  return new Promise((resolve, reject) => {
    window.clearNotifierTopic('simulations-errors');
    dispatch('validateSimulation', worksheets).then((valid) => {
      if (valid) {
        const worksheetsForSave = worksheets.map((w) => {
          if (w.type === SOURCE_OF_BUSINESS) {
            const w0 = cloneDeep(w);
            w0.scenarios = w.scenarios.map((s) => omit(s, ['baselineScenario', 'newScenario']));
            return w0;
          }
          return w;
        });
        const data = {
          csrf_token: csrfToken,
          worksheets: worksheetsForSave,
        };
        $btn.button('loading');
        $.post({
          method: 'POST',
          url: `/reports/${experimentId}/simulation/save/`,
          data: JSON.stringify(data),
          success: () => {
            window.Notifier(
              'general',
              'success',
              'Simulation settings have been saved successfully.',
              null,
              2000,
            );
            commit('SAVE_SAVED_WORKSHEETS');
          },
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          processData: false,
        }).fail(() => {
          window.Notifier(
            'general',
            'danger',
            'A trouble occurred while saving your simulation settings.',
            null,
            2000,
          );
        }).always(() => {
          $btn.button('reset');
          resolve();
        });
      }
      resolve();
    }).catch((errorObject) => dispatch('selectWorksheet', errorObject.worksheetIndex).then(() => dispatch('selectScenario', errorObject.scenarioIndex).then(() => {
      window.newNotifier({
        topic: 'simulations-errors',
        message: 'You have some validation errors in "Simulations" tab.',
        type: 'danger',
      });
    }).then(() => reject(errorObject))));
  });
}

export function copyConcept({ commit, getters }, concepts) {
  const lastConcept = concepts[concepts.length - 1];
  const concept = getters.getCopy(lastConcept);
  concept.name = generate.generateName(lastConcept.name);
  concept.color = generate.generateColor();
  commit('ADD_CONCEPT', { concepts, concept });
}

export function copyScenario({ commit, getters }, { worksheetId, scenarioId }) {
  const scenarioById = getters.getScenarioById({ worksheetId, scenarioId });
  const scenario = getters.getCopy(scenarioById);
  scenario.name = generate.generateName(scenarioById.name);
  commit('ADD_SCENARIO_TO_WORKSHEET', { worksheetId, scenario, sourceScenarioId: scenarioId });
  commit('SET_CURRENT_SCENARIO', getters.getWorksheetById(worksheetId).scenarios.length - 1);
}

export function copyWorksheet({ commit, getters }, { worksheetId }) {
  return new Promise((resolve) => {
    const worksheetById = getters.getWorksheetById(worksheetId);
    const newWorksheet = getters.getCopy(worksheetById);
    commit('ADD_WORKSHEET', newWorksheet);
    commit('SET_CURRENT_WORKSHEET', getters.getWorksheetsCount - 1);
    resolve(newWorksheet);
  });
}

export function addSourceOfBusinessWorksheet(
  { commit, getters },
  {
    name, scenarioName, newWorksheetId, newScenario, baselineWorksheetId, baselineScenario,
  },
) {
  return new Promise((resolve) => {
    commit(ADD_SOURCE_OF_BUSINESS_WORKSHEET, {
      id: generate.generateUniqueId(),
      name,
      scenarioName,
      newWorksheetId,
      newScenario,
      baselineWorksheetId,
      baselineScenario,
    });
    commit('SET_CURRENT_WORKSHEET', getters.getWorksheetsCount - 1);
    commit('SET_CURRENT_SCENARIO', 0);
    resolve();
  });
}

export function copyWithRotating({ commit, getters }, { worksheetId, scenario, conceptCountToCopy }) {
  const count = conceptCountToCopy > scenario.concepts.length
    ? scenario.concepts.length
    : conceptCountToCopy > 0
      ? conceptCountToCopy
      : 1;
  for (let conceptIndex = 0; conceptIndex < count; conceptIndex++) {
    const concept = scenario.concepts[conceptIndex];
    if (concept) {
      const newScenario = getters.getCopy(scenario);
      newScenario.name = `+ ${concept.name}`;
      newScenario.concepts.splice(conceptIndex + 1, conceptCountToCopy - conceptIndex - 1);
      newScenario.concepts.splice(0, conceptIndex);
      commit('ADD_SCENARIO_TO_WORKSHEET', {
        worksheetId,
        scenario: newScenario,
        sourceScenarioId: scenario.id,
      });
    }
  }
}

export function copyWithoutFirstConcept({ commit, getters }, { worksheetId, scenario, conceptCountToCopy }) {
  const count = conceptCountToCopy > scenario.concepts.length
    ? scenario.concepts.length
    : conceptCountToCopy > 0
      ? conceptCountToCopy
      : 1;
  for (let conceptIndex = 0; conceptIndex < count; conceptIndex++) {
    const concept = scenario.concepts[conceptIndex];
    if (concept) {
      const newScenario = getters.getCopy(scenario);
      newScenario.name = `- ${concept.name}`;
      newScenario.concepts.splice(conceptIndex, 1);
      commit('ADD_SCENARIO_TO_WORKSHEET', {
        worksheetId,
        scenario: newScenario,
        sourceScenarioId: scenario.id,
      });
    }
  }
}

export function copyScenarioWithOtherLevels(
  { commit, dispatch, getters },
  {
    worksheet, scenarioId, scenarioIndex, conceptIndex, attribute, levelValue,
  },
) {
  return new Promise((resolve) => {
    // If count of the worksheet's scenarios more the one, then we suggest create new worksheet and add these scenarios there
    if (
      worksheet.scenarios.length > 1
            && confirm(
              'There are some other scenarios in this worksheet already. Would you like to do sensitivity analysis in a new worksheet?',
            )
    ) {
      const scenario = getters.getScenarioById({ worksheetId: worksheet.id, scenarioId });
      dispatch('copyWorksheet', { worksheetId: worksheet.id }).then((newWorksheet) => {
        commit('SET_WORKSHEET_NAME', {
          worksheet: newWorksheet,
          name: `Sensitivity to ${attribute.name} in ${scenario.concepts[conceptIndex].name}`,
        });
        commit('DELETE_EXCEPT_SCENARIO', { worksheet: newWorksheet, scenarioIndex });
        // Set new scenario for the next handling
        scenarioId = newWorksheet.scenarios[0].id;
        resolve({ worksheet: newWorksheet, scenarioId });
      });
    } else {
      resolve({ worksheet, scenarioId });
    }
  }).then(({ worksheet, scenarioId }) => {
    const newScenario = getters.getScenarioById({ worksheetId: worksheet.id, scenarioId });
    // We have to create some scenarios with different values of gotten level value
    attribute.levels.forEach(async (level) => {
      // For brand specific applicability filter needed levels
      if (
        await dispatch('checkApplicability', {
          concept: newScenario.concepts[conceptIndex],
          attribute,
          value: level.value,
        })
      ) {
        const isNumberPrice = attribute.type === 'price' && getters.hasPriceObject;
        const comparison = isNumberPrice ? level.number != levelValue : level.value != levelValue;
        if (comparison) {
          const copy = getters.getCopy(newScenario);
          const concept = copy.concepts[conceptIndex];
          copy.name = `${copy.name} — ${concept.name} [ ${level.name} ]`;
          concept.attributes[attribute.value] = isNumberPrice ? level.number : level.value;
          dispatch('setConceptAttributeValue', {
            attributes: concept.attributes,
            attribute: attribute.value,
            value: isNumberPrice ? level.number : level.value,
          }).then(async () => {
            await dispatch('adjustConceptAttributes', { concept, attribute });
            commit('ADD_SCENARIO_TO_WORKSHEET', {
              worksheetId: worksheet.id,
              scenario: copy,
              sourceScenarioId: scenarioId,
            });
          });
        }
      }
    });
  });
}

export function deleteExceptScenario({ commit }, { worksheet, scenarioIndex }) {
  return new Promise((resolve) => {
    commit('DELETE_EXCEPT_SCENARIO', { worksheet, scenarioIndex });
    resolve();
  });
}

export function deleteWorksheet({ commit, state }, worksheetIndex) {
  commit('SET_CURRENT_WORKSHEET', Math.min(worksheetIndex, state.worksheets.length - 1 - 1));
  commit('DELETE_WORKSHEET', worksheetIndex);
}

export function setWorksheetData({ commit, getters }, { worksheetId, worksheetData }) {
  const worksheet = getters.getWorksheetById(worksheetId);
  if (worksheet) {
    worksheetData.scenarios.forEach((_scenario, scenarioIndex) => {
      commit('SET_SCENARIO_FROM_WORKSHEET_DATA', { worksheet, scenarioIndex, _scenario });
    });
    commit('SET_HAS_REVENUE_DATA', { worksheetId, hasRevenue: worksheetData.hasRevenue });
    commit('SET_ELASTICITY_CHART', { worksheetId, elasticityChart: worksheetData.elasticityChart });
    if (getters.getWorksheetElasticityChart(worksheetId)) {
      commit('SORT_SCENARIOS_BY_PRICE', worksheetId);
    }
    commit('SET_ELASTICITY_CHART_VARIABLE_CONCEPT', {
      worksheetId,
      elasticityChartVariableConcept: worksheetData.elasticityChartVariableConcept,
    });
    commit('SET_WORKSHEET_HASH', {
      worksheetId,
      hash: generate.generateHash(getters.getWorksheetData(worksheetId)),
    });
  }
}

export function hideConcept({ state, commit, getters }, { color, worksheetId }) {
  return new Promise((resolve) => {
    // Don't delete last concept
    const conceptsByColors = getters.getConceptsByColors(worksheetId);

    if (conceptsByColors.length < 2) {
      resolve(false);
      return;
    }
    const worksheet = getters.getWorksheetById(worksheetId);
    commit('HIDE_CONCEPT', { color, worksheet });
    resolve(state.applyHideFlag);
  });
}

export function addWorksheet({ commit, state }, worksheet) {
  commit('ADD_WORKSHEET', worksheet);
  commit('SET_CURRENT_WORKSHEET', state.worksheets.length - 1);
}

export function copyWorksheetByIndex({ state, getters, dispatch }, worksheetIndex) {
  const worksheetByIndex = getters.getWorksheetByIndex(worksheetIndex);
  const newWorksheet = getters.getCopy(worksheetByIndex);
  newWorksheet.name = generate.generateName(worksheetByIndex.name);
  if (newWorksheet.type === SOURCE_OF_BUSINESS) {
    newWorksheet.scenarios.forEach((scenario) => helpers.processSourceOfBusinessScenario(state.worksheets, scenario));
  }
  dispatch('addWorksheet', newWorksheet);
}

export function selectScenario({ commit }, scenarioIndex) {
  return new Promise((resolve) => {
    commit('SET_CURRENT_SCENARIO', scenarioIndex);
    resolve();
  });
}

export function selectWorksheet({ commit }, worksheetIndex) {
  return new Promise((resolve) => {
    commit('SET_CURRENT_WORKSHEET', worksheetIndex);
    resolve();
  });
}

export function setScenarioField({ commit }, {
  worksheetId, scenarioId, field, value,
}) {
  return new Promise((resolve) => {
    commit('SET_SCENARIO_FIELD', {
      worksheetId, scenarioId, field, value,
    });
    resolve();
  });
}

export function adjustScenariosSettings({ commit }, { worksheetId, scenarioId, field }) {
  return new Promise((resolve) => {
    commit('ADJUST_SCENARIOS_SETTINGS', { worksheetId, scenarioId, field });
    commit('SET_SHOW_ADVANCED_SETTINGS_FOR_ALL_SCENARIOS', true);
    resolve();
  });
}

export function adjustConceptNamesTo({ commit, dispatch, getters }, { worksheetId, action }) {
  return new Promise((resolve) => {
    const worksheetById = getters.getWorksheetById(worksheetId);
    Promise.all(worksheetById.scenarios.map((scenario) => dispatch(action, scenario))).then(resolve);
    commit('SET_SHOW_ADVANCED_SETTINGS_FOR_ALL_SCENARIOS', true);
  });
}

export function setConceptAttributeValue({ commit }, { attributes, attribute, value }) {
  return new Promise((resolve) => {
    commit('SET_CONCEPT_ATTRIBUTE_VALUE', { attributes, attribute, value });
    resolve();
  });
}

export function adjustConceptAttributes({ dispatch, getters }, { concept, attribute }) {
  for (let i = 0; i < getters.getAttributes.length; i++) {
    const checkedAttribute = getters.getAttributes[i];
    if (checkedAttribute.value === attribute.value) continue;
    const availableLevels = getters.getApplicabilityLevels(concept, checkedAttribute).map((l) => l.value);
    const isNumberPrice = checkedAttribute.type === 'price' && getters.hasPriceObject;
    const conceptAttributeValue = concept.attributes[checkedAttribute.value];
    if (!isNumberPrice) {
      if (!availableLevels.includes(conceptAttributeValue)) {
        dispatch('setConceptAttributeValue', {
          attributes: concept.attributes,
          attribute: checkedAttribute.value,
          value: availableLevels[0] || null,
        });
      }
    } else {
      const availableNumbers = getters.getApplicabilityLevels(concept, checkedAttribute).map((l) => l.number);
      if (!availableNumbers.includes(parseFloat(conceptAttributeValue))) {
        dispatch('setConceptAttributeValue', {
          attributes: concept.attributes,
          attribute: checkedAttribute.value,
          value: availableNumbers[0] || null,
        });
      }
    }
  }
}

export function checkApplicability({
  rootState, state, commit, getters,
}, { concept, attribute, value }) {
  if (!state.applicability.length || attribute.type === 'brand') {
    return true;
  }
  const isPriceOnBrandPriceTradeOff = rootState.simulations.experimentType === 'brandPriceTradeOff' && attribute.type
        === 'price';
  if (isPriceOnBrandPriceTradeOff) {
    if (typeof value === 'number') return true;
  }
  const shownLevels = getters.getShownLevels(concept, attribute);
  const showLevel = shownLevels.indexOf(value) !== -1;
  // Set first show level
  if (!showLevel && shownLevels.length > 0 && concept.attributes[attribute.value] === value) {
    const levelValue = shownLevels.slice(0, 1)[0];
    commit('SET_CONCEPT_ATTRIBUTE_VALUE', {
      attributes: concept.attributes,
      attribute: attribute.value,
      value: !isPriceOnBrandPriceTradeOff ? levelValue : attribute.levels.find((l) => l.value === levelValue).number,
    });
  }
  return showLevel;
}
