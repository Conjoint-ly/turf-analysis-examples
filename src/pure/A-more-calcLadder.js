const { TurfAnalysis } = require('turf-analysis-core/src/core');
const { A } = require('../../datasets/A');

const defaultExample = new TurfAnalysis(A, 'more', 1);

const result = defaultExample.calcLadder();

console.log(result);
