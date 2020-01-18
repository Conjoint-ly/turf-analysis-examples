import { SET } from '@conjointly/turf-analysis-ui/templates/new/components/simulations/store/mutation-types';

export default {
  state: {
    segments: [],
  },
  mutations: {
    [SET]: (state, { segments }) => {
      state.segments = segments;
    },
  },
};
