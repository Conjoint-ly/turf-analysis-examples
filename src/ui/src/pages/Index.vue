<template>
  <div>
    <h1>Progress: {{ progress * 100 }}%</h1>
    <button
      class="btn btn-primary"
      @click="calculate"
    >
      Calculate
    </button>
  </div>
</template>

<script>
import { B } from '../../../../datasets/B';

export default {
  name: 'PageIndex',
  data() {
    return {
      progress: 0,
    };
  },
  methods: {
    async calculate() {
      this.progress = 0;
      const response = await this.sendMessage({
        dataset: B.slice(0, 10),
        conversionType: 'more',
        cutoffValue: 1,
      }, {
        command: 'calcLadder',
        args: {
          source: {
            elements: [1, 2],
            name: 'calcMetrics test',
          },
          withReachByElement: true,
        },
      }, (percentage) => {
        this.progress = percentage;
      });

      console.log(response);
    },
  },
};
</script>
