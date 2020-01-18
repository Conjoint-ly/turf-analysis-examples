export default {
  processSourceOfBusinessScenario: (worksheets, scenario) => {
    if (typeof scenario.newWorksheetId === 'number') {
      scenario.newWorksheetId = scenario.newWorksheetId.toString();
    }
    if (typeof scenario.baselineWorksheetId === 'number') {
      scenario.baselineWorksheetId = scenario.baselineWorksheetId.toString();
    }
    if (typeof scenario.newScenarioId === 'number') {
      scenario.newScenarioId = scenario.newScenarioId.toString();
    }
    if (typeof scenario.baselineScenarioId === 'number') {
      scenario.baselineScenarioId = scenario.baselineScenarioId.toString();
    }
    const newWorksheet = worksheets.find((w) => w.id === scenario.newWorksheetId);
    newWorksheet && (scenario.newScenario = newWorksheet.scenarios.find((s) => s.id === scenario.newScenarioId));
    const baselineWorksheet = worksheets.find((w) => w.id === scenario.baselineWorksheetId);
    baselineWorksheet
        && (scenario.baselineScenario = baselineWorksheet.scenarios.find((s) => s.id === scenario.baselineScenarioId));
  },
};
