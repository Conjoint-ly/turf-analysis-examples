import Vue from 'vue';
import TurfWorker from '@conjointly/turf-analysis-core/turf.worker';

Vue.use({
  install: (VueInstance) => {
    VueInstance.prototype.$worker = new TurfWorker();

    VueInstance.mixin({
      methods: {
        async sendMessage({ dataset, conversionType, cutoffValue }, { command, args }, handler) {
          return new Promise((resolve) => {
            const channel = new MessageChannel();
            channel.port1.onmessage = (e) => {
              resolve(e.data);
            };

            const handlerChannel = new MessageChannel();
            if (handler) {
              handlerChannel.port1.onmessage = (e) => {
                handler(e.data);
              };
            }

            this.$worker.postMessage({
              instanceArgs: { dataset, conversionType, cutoffValue },
              command: {
                command,
                args,
              },
            }, [channel.port2, handlerChannel.port2]);
          });
        },
      },
    });
  },
});
