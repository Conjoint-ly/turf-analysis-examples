<template>
  <form>
    <div class="row">
      <template v-if="isProcessing">
        <div class="col-xs-12" :style="{marginTop: '20px'}">
          <label>Calculation is in progress...</label>
          <div class="progress">
            <div class="progress-bar progress-bar-striped active" :style="{width: `${progress * 100}%`}">
              {{ Math.round(progress * 10000) / 100 }}%
            </div>
          </div>
        </div>
      </template>
      <div class="col-xs-12">
        <div class="form-group">
          <label>Please select source of data</label>
          <turf-select v-model="model.source" :disabled="isProcessing" :style="{width: '100%'}">
            <option v-for="{key, text} in sources" :key="key" :value="key">
              {{ text }}
            </option>
          </turf-select>
        </div>
      </div>
      <div v-if="model.source === 'raw'" class="col-xs-12">
        <div class="form-group">
          <label>Type raw value</label>
          <textarea
            v-model="rawValue"
            :disabled="isProcessing"
            class="form-control"
            placeholder="Raw value"
            rows="10"
          />
        </div>
      </div>
      <div class="col-xs-6">
        <div class="form-group">
          <label>Rule for reach metric</label>
          <turf-select v-model="model.conversionMethod" :disabled="isProcessing" :style="{width: '100%'}">
            <option v-for="{key, text} in conversionMethods" :key="key" :value="key">
              {{ text }}
            </option>
          </turf-select>
        </div>
      </div>
      <div class="col-xs-6">
        <div class="form-group">
          <label v-html="'&nbsp;'" />
          <input
            v-model.number="model.cutoffValue"
            :disabled="isProcessing"
            class="form-control"
            placeholder="Cutoff value"
            type="number"
          >
        </div>
      </div>
      <div class="col-xs-12">
        <label>Preview of data</label>
        <div :style="{overflowX: 'auto'}">
          <table v-if="sourceObject" class="table table-bordered table-hover table-condensed">
            <tbody>
              <tr v-for="(row, index) in previewContent" :key="index">
                <td v-for="(col, subIndex) in row" :key="subIndex">
                  {{ col }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="col-xs-12">
        <button :disabled="isProcessing" class="pull-right btn btn-primary" @click="submit">
          <span>{{ isProcessing ? 'In progress...' : 'Ready' }}</span>
          <i :style="{marginLeft: '10px'}" class="fa fa-forward" />
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { TurfAnalysis } from '@conjointly/turf-analysis-core';
import { A } from '../../../../datasets/A';
import { B } from '../../../../datasets/B';
import { C } from '../../../../datasets/C';

export default {
  name: 'CreateCalculationForm',
  data() {
    return {
      progress: 0,
      isProcessing: false,

      previewContent: null,

      rawValue: '',

      model: {
        source: 'a',
        conversionMethod: 'top',
        cutoffValue: 1,
      },
      sources: [
        {
          key: 'a',
          text: 'Test case A',
          getContent: () => A,
        },
        {
          key: 'b',
          text: 'Test case B',
          getContent: () => B,
        },
        {
          key: 'c',
          text: 'Test case C',
          getContent: () => C,
        },
        {
          key: 'raw',
          text: 'Raw input',
          getContent: () => this.rawValue.split('\n').map((row) => row.split(',').map((value) => +(value.trim()))),
        },
      ],
      conversionMethods: Object.keys(TurfAnalysis.getConversionMethods()).map((key) => ({
        key,
        text: key,
      })),
    };
  },
  computed: {
    sourceObject() {
      const source = this.sources.find(({ key }) => key === this.model.source);

      return source || null;
    },
  },
  watch: {
    async rawValue() {
      await this.$nextTick;
      await this.calculatePreview();
    },
    'model.source': {
      immediate: true,
      async handler() {
        await this.$nextTick;
        await this.calculatePreview();
      },
    },
  },
  methods: {
    async submit() {
      this.isProcessing = true;
      this.progress = 0;

      const response = await this.sendMessage({
        dataset: await this.sourceObject.getContent(),
        conversionType: this.model.conversionMethod,
        cutoffValue: this.model.cutoffValue,
      }, {
        command: 'calcLadder',
      }, (percentage) => {
        this.progress = percentage;
      });

      console.log(response);
      this.isProcessing = false;
    },
    async calculatePreview() {
      this.previewContent = await this.sourceObject.getContent().slice(0, 5).map((row) => row.slice(0, 10));
    },
  },
};
</script>
