<template>
  <div>
    heh
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
  created() {
    this.$router.push({ name: 'calculations-id', params: { id: 'new' } });
  },
  methods: {
    async calculate() {
      this.progress = 0;
      const response = await this.sendMessage({
        dataset: B,
        // conversionType: 'more',
        // cutoffValue: 1,
      }, {
        command: 'calcMetrics',
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
