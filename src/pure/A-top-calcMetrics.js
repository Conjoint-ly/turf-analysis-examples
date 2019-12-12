const { TurfAnalysis } = require('turf-analysis-core/src/core');
const { A } = require('../datasets/A');

const defaultExample = new TurfAnalysis(A);

const result = defaultExample.calcMetrics(
  {
    elements: [1, 2],
    name: 'calcMetrics test',
  },
  true,
);

console.log(result);
