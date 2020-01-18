import attributeValidators from '@conjointly/turf-analysis-ui/templates/new/components/simulations/validators/attribute';
import conceptNameValidators from '@conjointly/turf-analysis-ui/templates/new/components/simulations/validators/concept-name';
import sourceOfBusinessWorksheet from '@conjointly/turf-analysis-ui/templates/new/components/simulations/validators/source-of-business-worksheet';
import { validationPromisesReducer, withError } from '@conjointly/turf-analysis-ui/templates/new/services/validator';
import { SOURCE_OF_BUSINESS, WHAT_IF } from '@conjointly/turf-analysis-ui/templates/new/components/simulations/worksheet-types';

export default {
  actions: {
    validateSimulation({ dispatch }, worksheets) {
      return validationPromisesReducer(
        worksheets.map((worksheet, worksheetIndex) => {
          if (worksheet.type === WHAT_IF) return withError(dispatch)('validateWorksheet', worksheet, { worksheetIndex });
          if (worksheet.type === SOURCE_OF_BUSINESS) return withError(dispatch)('validateSourceOfBusinessWorksheet', worksheet, { worksheetIndex });
          return Promise.resolve(true);
        }),
      );
    },
    validateSourceOfBusinessWorksheet({ dispatch }, worksheet) {
      if (worksheet.type === SOURCE_OF_BUSINESS) {
        return validationPromisesReducer(
          worksheet.scenarios.map((scenario, scenarioIndex) => withError(dispatch)('validateSourceOfBusinessScenario', { scenario }, { scenarioIndex })),
        );
      }
      return Promise.resolve(true);
    },
    validateWorksheet({ dispatch }, worksheet) {
      if (worksheet.type === WHAT_IF) {
        return validationPromisesReducer(
          worksheet.scenarios.map((scenario, scenarioIndex) => withError(dispatch)(
            'validateScenario',
            { scenario, worksheetId: worksheet.id },
            { scenarioIndex },
          )),
        );
      }
      return Promise.resolve(true);
    },
    validateSourceOfBusiness({ dispatch }, {
      newWorksheet, baselineWorksheet, newScenario, baselineScenario,
    }) {
      return validationPromisesReducer([
        withError(dispatch)('validate/some', {
          bind: {
            newWorksheet, baselineWorksheet, newScenario, baselineScenario,
          },
          validators: sourceOfBusinessWorksheet,
        }),
      ]);
    },
    validateSourceOfBusinessScenario({ dispatch, getters }, { scenario }) {
      const newWorksheet = getters.getWorksheetById(scenario.newWorksheetId) || null;
      const baselineWorksheet = getters.getWorksheetById(scenario.baselineWorksheetId) || null;
      const newScenario = getters.getScenarioById({
        worksheetId: scenario.newWorksheetId,
        scenarioId: scenario.newScenarioId,
      }) || null;
      const baselineScenario = getters.getScenarioById({
        worksheetId: scenario.baselineWorksheetId,
        scenarioId: scenario.baselineScenarioId,
      }) || null;
      return withError(dispatch)(
        'validateSourceOfBusiness',
        {
          newWorksheet, baselineWorksheet, newScenario, baselineScenario,
        },
        { scenario, invalidSourceOfBusinessScenario: true },
      ).then(() => validationPromisesReducer([
        withError(dispatch)(
          'validateWorksheet',
          { worksheet: newWorksheet },
          { invalidNewWorksheet: true },
        ),
        withError(dispatch)(
          'validateWorksheet',
          { worksheet: baselineWorksheet },
          { invalidBaselineWorksheet: true },
        ),
        withError(dispatch)(
          'validateScenario',
          { scenario: newScenario, worksheetId: scenario.newWorksheetId },
          { invalidNewScenario: true },
        ),
        withError(dispatch)(
          'validateScenario',
          { scenario: baselineScenario, worksheetId: scenario.baselineWorksheetId },
          { invalidBaselineScenario: true },
        ),
      ]));
    },
    validateScenario({ dispatch }, { scenario, worksheetId }) {
      return validationPromisesReducer([
        withError(dispatch)('validateConceptNames', { scenario, worksheetId }, { invalidConceptNames: true }),
        withError(dispatch)('validateConceptAttributes', { scenario }, { invalidAttributes: true }),
      ]);
    },
    validateConceptNames({ dispatch, getters }, { scenario, worksheetId }) {
      const map = scenario.concepts.map((c, conceptNameIndex) => withError(dispatch)(
        'validate/some',
        {
          bind: {
            conceptName: c.name,
            conceptsNames: getters.getConceptsNames(worksheetId, scenario.id),
            conceptIndex: conceptNameIndex,
          },
          validators: conceptNameValidators,
        },
        { conceptNameIndex },
      ));
      if (scenario.none) {
        const conceptNameIndex = scenario.concepts.length;
        map.push(
          withError(dispatch)(
            'validate/some',
            {
              bind: {
                conceptName: scenario.none.name,
                conceptsNames: getters.getConceptsNames(worksheetId, scenario.id),
                conceptIndex: conceptNameIndex,
              },
              validators: conceptNameValidators,
            },
            { conceptNameIndex },
          ),
        );
      }
      return validationPromisesReducer(map);
    },
    validateAttributes({ getters, dispatch }, { concept }) {
      let brandAttributeValue = null;
      const brandAttribute = getters.getBrandAttribute;
      if (brandAttribute) {
        brandAttributeValue = concept.attributes[brandAttribute.value];
      }
      return validationPromisesReducer(
        getters.getAttributes.map((attribute, attributeIndex) => withError(dispatch)(
          'validate/some',
          {
            bind: {
              attributeValue: concept.attributes[attribute.value],
              applicabilityLevels: getters.getApplicabilityLevels(concept, attribute),
              isNumberPrice: attribute.type === 'price' && getters.hasPriceObject,
              priceObject: getters.getPriceObject(brandAttributeValue),
            },
            validators: attributeValidators,
          },
          { attributeIndex },
        )),
      );
    },
    validateConceptAttributes({ dispatch }, { scenario }) {
      return validationPromisesReducer(
        scenario.concepts.map((concept, conceptIndex) => withError(dispatch)('validateAttributes', { concept }, { conceptIndex })),
      );
    },
  },
};
