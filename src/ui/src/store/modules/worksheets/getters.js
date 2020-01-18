import { SOURCE_OF_BUSINESS, WHAT_IF } from '@conjointly/turf-analysis-ui/templates/new/components/simulations/worksheet-types';
import generate from '@conjointly/turf-analysis-ui/templates/new/components/simulations/utils/generate';
import unionBy from 'lodash/unionBy';
import pick from 'lodash/pick';
import format from '@conjointly/turf-analysis-ui/templates/new/components/simulations/utils/format';
import { Parser } from 'expr-eval';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import keys from 'lodash/keys';

export const getters = {
  getWorksheetElasticityChart: (state) => (worksheetId) => state.worksheetsElasticityChart[worksheetId],
  isDirty: (state, getters) => (worksheetId) => {
    const worksheetById = getters.getWorksheetById(worksheetId);
    if (worksheetById) {
      if (worksheetById.type === WHAT_IF) {
        return (
          getters.getWorksheetHash(worksheetId)
                    !== generate.generateHash(getters.getWorksheetData(worksheetId))
        );
      }
      if (worksheetById.type === SOURCE_OF_BUSINESS) {
        return getters.getDirtyWorksheetIdsOfSourceOfBusiness(worksheetId).length > 0;
      }
    }
  },
  getHasRevenueByWorksheetId: (state) => (worksheetId) => state.worksheetsHasRevenue[worksheetId] || false,
  getDirtyWorksheetIdsOfSourceOfBusiness: (state, getters) => (worksheetId) => {
    const worksheetById = getters.getWorksheetById(worksheetId);
    const dirtyWorksheets = [];
    worksheetById.scenarios.forEach((scenario) => {
      if (!dirtyWorksheets.includes(scenario.newWorksheetId) && getters.isDirty(scenario.newWorksheetId)) {
        dirtyWorksheets.push(scenario.newWorksheetId);
      }
      if (!dirtyWorksheets.includes(scenario.newWorksheetId) && getters.isDirty(scenario.baselineWorksheetId)) {
        dirtyWorksheets.push(scenario.baselineWorksheetId);
      }
    });
    return dirtyWorksheets;
  },
  getWorksheetHash: (state) => (worksheetId) => state.hashes[worksheetId] || null,
  getWorksheetData: (state, getters) => (worksheetId) => {
    const worksheet = getters.getWorksheetById(worksheetId);

    const scenarioData = (scenario) => {
      const out = {
        segment: parseInt(scenario.segment),
        productType: scenario.productType,
        concepts: [],
      };
      scenario.concepts.forEach((concept) => {
        out.concepts.push({
          attributes: concept.attributes,
          relativeAvailability: parseFloat(concept.relativeAvailability),
          adjustedPreferenceShare: parseFloat(concept.adjustedPreferenceShare),
          revenue: parseFloat(concept.revenue),
        });
      });
      if (scenario.none) {
        out.none = {
          relativeAvailability: parseFloat(scenario.none.relativeAvailability),
          adjustedPreferenceShare: parseFloat(scenario.none.adjustedPreferenceShare),
        };
      }
      return out;
    };

    const outWorksheet = {
      scenarios: [],
    };

    worksheet.scenarios.forEach((s) => {
      outWorksheet.scenarios.push(scenarioData(s));
    });

    return outWorksheet;
  },
  getScenarioDataForSegregate: (state, getters) => ({ worksheetId, scenarioId }) => {
    const scenarioById = getters.getScenarioById({ worksheetId, scenarioId });
    const data = {
      id: scenarioById.id,
      name: scenarioById.name,
      segment: scenarioById.segment,
      concepts: scenarioById.concepts.map((c) => ({ name: c.name, attributes: c.attributes })),
    };
    if (scenarioById.none) {
      Object.assign(data, { none: { name: scenarioById.none.name } });
    }
    return data;
  },
  getCurrentWorksheet: (state) => state.worksheets[state.currentWorksheetIndex],
  getWorksheetsCount: (state) => state.worksheets.length,
  getCurrentWorksheetIndex: (state) => state.currentWorksheetIndex,
  getCurrentScenario: (state) => {
    const worksheet = state.worksheets[state.currentWorksheetIndex];
    return state.currentScenarioIndexes[state.currentWorksheetIndex]
      ? worksheet.scenarios[state.currentScenarioIndexes[state.currentWorksheetIndex]]
      : worksheet.scenarios[state.defaultCurrentScenarioIndex];
  },
  getCurrentScenarioIndex: (state) => state.currentScenarioIndexes[state.currentWorksheetIndex] || state.defaultCurrentScenarioIndex,
  getWorksheetById: (state) => (worksheetId) => state.worksheets.find((w) => w.id === worksheetId),
  getWorksheetByIndex: (state) => (worksheetIndex) => state.worksheets[worksheetIndex],
  getScenarioById: (state, getters) => ({ worksheetId, scenarioId }) => {
    const worksheetById = getters.getWorksheetById(worksheetId);
    return worksheetById && worksheetById.scenarios.find((s) => s.id === scenarioId);
  },
  getScenarioField: (state, getters) => (worksheetId, scenarioId, field) => getters.getScenarioById({ worksheetId, scenarioId })[field],
  hasHiddenConcepts: (state, getters) => (worksheetId) => {
    let hidden = 0;
    getters.getWorksheetById(worksheetId).scenarios.forEach((scenario) => {
      if (!scenario.show || (scenario.none && !scenario.none.show)) {
        hidden = 1;
        return false;
      }
      scenario.concepts.forEach((concept) => {
        if (!concept.show) {
          hidden = 1;
          return false;
        }
      });
      if (hidden) {
        return false;
      }
    });

    return hidden;
  },
  getApplicabilityLevels: (state, getters) => (concept, attribute) => attribute.levels.filter((level) => getters.getShownLevels(concept, attribute).indexOf(level.value) !== -1),
  hasDifferentFieldInScenarios: (state, getters) => ({ worksheetId, field }) => {
    let value;
    return !getters.getWorksheetById(worksheetId).scenarios.map((scenario) => {
      if (value === undefined) {
        value = scenario[field];
      }
      return scenario[field] === value;
    }).reduce((previousValue, currentValue) => previousValue && currentValue);
  },
  getMovementsInPreferenceShareChartData: () => (worksheet) => {
    const { scenarios } = worksheet;
    const data = [];
    const maxCountConcepts = scenarios.reduce(
      (b, a) => Math.max(
        unionBy(
          a.baselineScenario && a.baselineScenario.concepts,
          a.newScenario && a.newScenario.concepts,
          'name',
        ).length,
        b,
      ),
      0,
    );
    const maxCountNones = scenarios.reduce(
      (b, a) => Math.max(
        unionBy(
          a.baselineScenario && a.baselineScenario.none ? [a.baselineScenario.none] : [],
          a.newScenario && a.newScenario.none ? [a.newScenario.none] : [],
          'name',
        ).length,
        b,
      ),
      0,
    );
    const header = ['Scenario'];
    for (let i = 0; i < maxCountConcepts; i++) {
      header.push(`Concept ${i + 1}`);
      header.push({ role: 'tooltip' });
      header.push({ role: 'style' });
    }
    for (let i = 0; i < maxCountNones; i++) {
      header.push(`None of above ${i + 1}`);
      header.push({ role: 'tooltip' });
      header.push({ role: 'style' });
    }
    data.push(header);
    scenarios.forEach((scenario) => {
      const cells = [];
      const { newScenario } = scenario;
      const { baselineScenario } = scenario;
      const concepts = unionBy(
        newScenario && newScenario.concepts,
        baselineScenario && baselineScenario.concepts,
        'name',
      ).map((concept) => pick(concept, ['name', 'color', 'show']));
      concepts.forEach((concept) => {
        const newConcept = newScenario && newScenario.concepts.find((c) => c.name === concept.name);
        const baselineConcept = baselineScenario && baselineScenario.concepts.find((c) => c.name === concept.name);
        const move = (newConcept ? newConcept.adjustedPreferenceShare : 0.0)
                    - (baselineConcept ? baselineConcept.adjustedPreferenceShare : 0.0);
        const value = (move * 1000) / 10;
        cells.push(value);
        cells.push(`${concept.name} : ${Math.round(value * 100) / 100}%`);
        cells.push(concept.color);
      });
      for (let i = 0; i < maxCountConcepts - concepts.length; i++) {
        cells.push(0);
        cells.push('');
        cells.push('#FFF');
      }
      const nones = unionBy(
        newScenario && newScenario.none ? [newScenario.none] : [],
        baselineScenario && baselineScenario.none ? [baselineScenario.none] : [],
        'name',
      ).map((none) => pick(none, ['name', 'color']));
      nones.forEach((none) => {
        const newNone = newScenario && newScenario.none && newScenario.none.name === none.name ? newScenario.none : null;
        const baselineNone = baselineScenario && baselineScenario.none && baselineScenario.none.name === none.name
          ? baselineScenario.none
          : null;
        const move = (newNone ? newNone.adjustedPreferenceShare : 0.0)
                    - (baselineNone ? baselineNone.adjustedPreferenceShare : 0.0);
        const value = (move * 1000) / 10;
        cells.push(value);
        cells.push(`${none.name} : ${Math.round(value * 100) / 100}%`);
        cells.push(none.color);
      });
      for (let i = 0; i < maxCountNones - nones.length; i++) {
        cells.push(0);
        cells.push('');
        cells.push('#FFF');
      }
      data.push([scenario.name].concat(cells));
    });
    return data;
  },
  getChartData: (state, getters) => ({ worksheetId, field }) => {
    const data = [];

    const { scenarios } = getters.getWorksheetById(worksheetId);

    // Get scenario with max count of concepts
    const maxConceptScenario = scenarios.reduce((a, b) => (a.concepts.length > b.concepts.length ? a : b));

    // Construct headers
    const header = [maxConceptScenario.price ? 'Price' : 'Scenario'];
    let noData = [''];

    maxConceptScenario.concepts.forEach((concept, i) => {
      header.push(`Concept ${i + 1}`);
      header.push({ role: 'tooltip' });
      header.push({ role: 'style' });

      // Fill no data
      noData = noData.concat([0, '', '#ffffff']);
    });
    if (field == 'adjustedPreferenceShare' && maxConceptScenario.none) {
      header.push('None of the above');
      header.push({ role: 'tooltip' });
      header.push({ role: 'style' });

      // Fill no data
      noData = noData.concat([0, '', '#ffffff']);
    }
    data.push(header);

    // Construct body
    scenarios.forEach((scenario) => {
      if (scenario.show) {
        const cells = [];
        let validConceptCount = 0;

        // Concepts
        maxConceptScenario.concepts.forEach((concept, i) => {
          if (scenario.concepts[i] && scenario.concepts[i].show) {
            validConceptCount++;
            let value;
            if (field === 'adjustedPreferenceShare') {
              value = Math.round(scenario.concepts[i][field] * 1000) / 10;
              cells.push(value);
              cells.push(`${scenario.concepts[i].name}: ${value}%`);
            } else {
              value = Math.round(scenario.concepts[i][field]);
              cells.push(value);
              cells.push(`${scenario.concepts[i].name}: ${format.formatMoney(value, '$')}`);
            }
            cells.push(scenario.concepts[i].color);
          } else {
            cells.push(0);
            cells.push('');
            cells.push('#FFF');
          }
        });

        // None of the above
        if (field === 'adjustedPreferenceShare' && scenario.none) {
          if (scenario.none.show) {
            validConceptCount++;
            const value = Math.round(scenario.none[field] * 1000) / 10;
            cells.push(value);
            cells.push(`${scenario.none.name}: ${value}%`);
            cells.push(scenario.none.color);
          } else {
            cells.push(0);
            cells.push('');
            cells.push('#FFF');
          }
        }

        if (validConceptCount) {
          data.push([scenario.price ? scenario.price : scenario.name].concat(cells));

          // Reset no data
          noData = false;
        }
      }
    });

    // Handle no data
    if (noData) {
      data.push(noData);
    }

    return data;
  },
  getRevenueValue: (state, getters) => (concept, formulas) => {
    const topic = `revenue-${generate.generateHash(concept.name)}`;
    let value;
    const share = concept.adjustedPreferenceShare || 0;
    const price = getters.getPriceForConcept(concept) || 0;
    if (formulas.hasOwnProperty(concept.name)) {
      try {
        value = Parser.evaluate(formulas[concept.name], { price, share });
        if (window.notifierExists(topic)) {
          window.clearNotifierTopic(topic);
        }
      } catch (e) {
        if (!window.notifierExists(topic)) {
          window.newNotifier({
            topic,
            type: 'warning',
            message:
                            `Can't calculate revenue formula for "${
                              concept.name
                            }" : "${
                              formulas[concept.name]
                            }"`,
          });
        }
        value = 0.0;
      }
    } else {
      value = 0.0;
    }
    return value;
  },
  getRevenueChartData: (state, getters) => ({ worksheetId, formulas }) => {
    const data = [];

    const { scenarios } = getters.getWorksheetById(worksheetId);

    // Get scenario with max count of concepts
    const maxConceptScenario = scenarios.reduce((a, b) => (a.concepts.length > b.concepts.length ? a : b));

    // Construct headers
    const header = [maxConceptScenario.price ? 'Price' : 'Scenario'];
    let noData = [''];

    maxConceptScenario.concepts.forEach((concept, i) => {
      header.push(`Concept ${i + 1}`);
      header.push({ role: 'tooltip' });
      header.push({ role: 'style' });

      // Fill no data
      noData = noData.concat([0, '', '#ffffff']);
    });
    data.push(header);

    // Construct body
    scenarios.forEach((scenario) => {
      if (scenario.show) {
        const cells = [];
        let validConceptCount = 0;

        // Concepts
        maxConceptScenario.concepts.forEach((concept, i) => {
          const theConcept = scenario.concepts[i];

          if (theConcept && theConcept.show) {
            validConceptCount++;
            const value = getters.getRevenueValue(theConcept, formulas);
            cells.push(value);
            cells.push(`${theConcept.name}: ${format.formatMoney(value, '$')}`);
            cells.push(theConcept.color);
          } else {
            cells.push(0);
            cells.push('');
            cells.push('#FFF');
          }
        });

        if (validConceptCount) {
          data.push([scenario.price ? scenario.price : scenario.name].concat(cells));

          // Reset no data
          noData = false;
        }
      }
    });

    // Handle no data
    if (noData) {
      data.push(noData);
    }

    return data;
  },
  getCopy: (state, getters) => (obj, withoutId) => {
    // todo should by replaced by cloneDeep?
    const copy = JSON.parse(JSON.stringify(obj));
    if (!withoutId) {
      copy.id = generate.generateUniqueId();
      // We have to re-generate ids recursively [scenarios -> concepts]
      if (copy.scenarios) {
        const { scenarios } = copy;
        copy.scenarios = [];
        scenarios.forEach((scenario) => copy.scenarios.push(getters.getCopy(scenario)));
      } else if (copy.concepts) {
        const { concepts } = copy;
        copy.concepts = [];
        concepts.forEach((concept) => copy.concepts.push(getters.getCopy(concept)));
      }
    }
    return copy;
  },
  getForExportToCsv: (state, getters) => (worksheetId) => {
    const worksheet = getters.getWorksheetById(worksheetId);
    const currentRevenueId = state.currentRevenueIds[worksheetId];
    const revenue = currentRevenueId && getters.getRevenue(worksheetId, currentRevenueId);
    const formulas = (revenue && revenue.formulas) || [];
    // Prepare hash table
    const scenarios = [];
    const concepts = [];
    const hashTable = [];
    // const worksheet = vm.worksheet;
    worksheet.scenarios.forEach((scenario) => {
      const scenarioName = scenario.name.trim();
      if (scenarios.indexOf(scenarioName) === -1) {
        scenarios.push(scenarioName);
        hashTable[scenarioName] = [];
      }
      scenario.concepts.forEach((concept) => {
        const conceptName = concept.name.trim();
        if (concepts.indexOf(conceptName) === -1) {
          concepts.push(conceptName);
        }
        if (!hashTable[scenarioName][conceptName]) {
          hashTable[scenarioName][conceptName] = {};
        }
        hashTable[scenarioName][conceptName].adjustedPreferenceShare = concept.adjustedPreferenceShare;
        hashTable[scenarioName][conceptName].revenue = getters.getRevenueValue(concept, formulas);
      });
      if (scenario.none) {
        const noneName = scenario.none.name.trim();
        if (concepts.indexOf(noneName) === -1) {
          concepts.push(noneName);
        }
        if (!hashTable[scenarioName][noneName]) {
          hashTable[scenarioName][noneName] = {};
        }
        hashTable[scenarioName][noneName].adjustedPreferenceShare = scenario.none.adjustedPreferenceShare;
      }
    });

    // Generic table
    const table = [];

    // Type row
    table.push(new Array(scenarios.length * 2 + 1).fill(''));
    table[0][1] = 'Preference share';
    table[0][scenarios.length + 1] = 'Revenue';

    // Scenario row
    table.push([''].concat(scenarios).concat(scenarios));

    // Data rows
    concepts.forEach((conceptName) => {
      const row = [conceptName];
      ['adjustedPreferenceShare', 'revenue'].forEach((field) => {
        scenarios.forEach((scenarioName) => {
          if (
            hashTable[scenarioName]
                        && hashTable[scenarioName][conceptName]
                        && hashTable[scenarioName][conceptName][field]
          ) {
            row.push(hashTable[scenarioName][conceptName][field]);
          } else {
            row.push('');
          }
        });
      });
      table.push(row);
    });
    return table;
  },
  getConceptsNames: (state, getters) => (worksheetId, scenarioId) => {
    const scenarioById = getters.getScenarioById({ worksheetId, scenarioId });
    const names = scenarioById.concepts.map((c) => getters.getConceptName(c));
    scenarioById.none && names.push(scenarioById.none.name.trim());
    return names;
  },
  getAttributes: (state) => state.attributes,
  getPriceAttribute,
  getSingleAttribute: (state) => {
    if (state.attributes.length !== 1) return false;
    return state.attributes[0];
  },
  getBrandAttribute,
  getConceptName: () => (concept) => concept.name.trim(),
  getConceptNames: () => (worksheet) => worksheet.scenarios.map((scenario) => scenario.concepts.map((c) => c.name)).reduce((allConceptNames, scenarioConceptsNames) => {
    if (allConceptNames === undefined) {
      allConceptNames = [];
    }
    scenarioConceptsNames.forEach((name) => {
      if (allConceptNames.indexOf(name) === -1) allConceptNames.push(name);
    });
    return allConceptNames;
  }),
  getRevenue: (state, getters) => (worksheetId, revenueId) => {
    const worksheetById = getters.getWorksheetById(worksheetId);
    const formulas = {};
    getters.getConceptNames(worksheetById).forEach((name) => {
      formulas[name] = state.default.defaultFormula;
    });
    const revenueElement = worksheetById.revenues[revenueId];
    if (revenueElement === undefined) revenueId = 'DEFAULT';
    return revenueId !== 'DEFAULT'
      ? merge(
        omit(revenueElement, ['formulas']),
        merge({ formulas }, { formulas: pick(revenueElement.formulas, keys(formulas)) }),
      )
      : merge(omit(state.default, ['formulas']), { formulas });
  },
  getRevenues(state, getters) {
    return (worksheetId) => {
      const worksheet = getters.getWorksheetById(worksheetId);
      return worksheet.revenues;
    };
  },
  getBrandForConcept: (state, getters) => (concept) => {
    const brandAttribute = getters.getBrandAttribute;
    if (!brandAttribute) return false;
    const LseqNum = concept.attributes[brandAttribute.value].match(/A\d+L(\d+)/)[1];
    const value = brandAttribute.levels.find((level) => level.value === `${brandAttribute.value}L${LseqNum}`);
    return value.name.trim();
  },
  getPriceForConcept: (state, getters) => (concept) => {
    const priceAttribute = getters.getPriceAttribute;
    if (!priceAttribute) return false;
    const attribute = concept.attributes[priceAttribute.value];
    if (isNaN(attribute)) {
      if (typeof attribute === 'string') {
        const regExp = /^A\d+L(\d+)$/;
        if (regExp.test(attribute)) {
          const LseqNum = attribute.match(regExp)[1];
          const value = priceAttribute.levels.find(
            (level) => level.value === `${priceAttribute.value}L${LseqNum}`,
          );
          return parseFloat(value.number);
        }
      }
      return 0;
    }
    return parseFloat(attribute);
  },
  getSingleAttributeForConcept: (state, getters) => (concept) => {
    const singleAttribute = getters.getSingleAttribute;
    if (!singleAttribute) return false;
    const LseqNum = concept.attributes[singleAttribute.value].match(/A\d+L(\d+)/)[1];
    const value = singleAttribute.levels.find((level) => level.value === `${singleAttribute.value}L${LseqNum}`);
    return value.name.trim();
  },
  getConceptsByColors: (state, getters) => (worksheetId) => {
    const conceptsByColors = [];
    const worksheetById = getters.getWorksheetById(worksheetId);
    const addColor = (scenario) => {
      if (scenario.show) {
        scenario.concepts.forEach((concept) => {
          if (concept.show && conceptsByColors.indexOf(concept.color) === -1) {
            conceptsByColors.push(concept.color);
          }
        });
        if (scenario.none && scenario.none.show && conceptsByColors.indexOf(scenario.none.color) === -1) {
          conceptsByColors.push(scenario.none.color);
        }
      }
    };
    if (worksheetById.type === WHAT_IF) {
      worksheetById.scenarios.forEach(addColor);
    }
    if (worksheetById.type === SOURCE_OF_BUSINESS) {
      worksheetById.scenarios.forEach((scenario) => {
        addColor(scenario.newScenario);
        addColor(scenario.baselineScenario);
      });
    }
    return conceptsByColors;
  },
  getWorksheetElasticityChartVariableConcept: (state) => (worksheetId) => state.worksheetsElasticityChartVariableConcept[worksheetId] || [],
  getForExportSourceOfBusinessToCsv: (state, getters) => (worksheetId) => {
    const worksheet = getters.getWorksheetById(worksheetId);
    const { scenarios } = worksheet;
    const rows = [];
    const headers = [''];
    scenarios.forEach((s) => headers.push(s.name));
    rows.push(headers);
    const rowsRaw = {};
    scenarios.forEach((scenario) => {
      const { newScenario } = scenario;
      const { baselineScenario } = scenario;
      const concepts = unionBy(
        newScenario && newScenario.concepts,
        baselineScenario && baselineScenario.concepts,
        'name',
      ).map((concept) => pick(concept, ['name']));
      concepts.forEach((concept) => {
        if (!rowsRaw.hasOwnProperty(concept.name)) rowsRaw[concept.name] = {};
        const newConcept = newScenario && newScenario.concepts.find((c) => c.name === concept.name);
        const baselineConcept = baselineScenario && baselineScenario.concepts.find((c) => c.name === concept.name);
        const move = (newConcept ? newConcept.adjustedPreferenceShare : 0.0)
                    - (baselineConcept ? baselineConcept.adjustedPreferenceShare : 0.0);
        rowsRaw[concept.name][scenario.id] = (move * 1000) / 10;
      });
      const nones = unionBy(
        newScenario && newScenario.none ? [newScenario.none] : [],
        baselineScenario && baselineScenario.none ? [baselineScenario.none] : [],
        'name',
      ).map((none) => pick(none, ['name']));
      nones.forEach((none) => {
        if (!rowsRaw.hasOwnProperty(none.name)) rowsRaw[none.name] = {};
        const newNone = newScenario.none && newScenario.none.name === none.name ? newScenario.none : null;
        const baselineNone = baselineScenario.none && baselineScenario.none.name === none.name ? baselineScenario.none : null;
        const move = (newNone ? newNone.adjustedPreferenceShare : 0.0)
                    - (baselineNone ? baselineNone.adjustedPreferenceShare : 0.0);
        rowsRaw[none.name][scenario.id] = (move * 1000) / 10;
      });
    });
    for (const concept in rowsRaw) {
      if (rowsRaw.hasOwnProperty(concept)) {
        const row = [concept];
        scenarios.forEach((s) => {
          if (rowsRaw[concept][s.id]) {
            row.push(rowsRaw[concept][s.id]);
          } else {
            row.push('');
          }
        });
        rows.push(row);
      }
    }
    return rows;
  },
  brands: (state) => {
    const obj = {};
    state.applicability.forEach((pair) => {
      if (!obj[pair[0]]) {
        obj[pair[0]] = [pair[1]];
      } else {
        obj[pair[0]].push(pair[1]);
      }
    });
    return obj;
  },
  getShownLevels: (state, getters) => (concept, attribute) => {
    const brandAttribute = getters.getBrandAttribute;
    let hiddenLevels = getters.brands[concept.attributes[brandAttribute.value]];
    hiddenLevels = hiddenLevels || [];
    // fixme используется "новая" инвертированая applicability table
    if (state.isVersion1 && attribute.type === 'price') {
      return attribute.levels.filter((level) => hiddenLevels.indexOf(level.value) !== -1).map((level) => level.value);
    }
    return attribute.levels.filter((level) => hiddenLevels.indexOf(level.value) === -1).map((level) => level.value);
  },
};

export function getBrandAttribute(state) {
  const filter = state.attributes.filter((attribute) => attribute.type === 'brand');
  return filter.length > 0 ? filter[0] : false;
}

export function getPriceAttribute(state) {
  const filter = state.attributes.filter((attribute) => attribute.type === 'price');
  return filter.length > 0 ? filter[0] : false;
}
