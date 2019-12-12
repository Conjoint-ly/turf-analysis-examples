const { TurfAnalysis } = require('turf-analysis-core/src/core');
const { B } = require('../datasets/B');

const defaultExample = new TurfAnalysis(B);

const result = defaultExample.calcMetrics(
  {
    elements: [1, 2],
    name: 'calcMetrics test',
  },
  true,
);

console.log(result);
