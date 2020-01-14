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
            <optgroup
              v-for="(sources, group) in sourcesGroups"
              :key="group"
              :label="group"
            >
              <option v-for="{key, text} in sources" :key="key" :value="key">
                {{ text }}
              </option>
            </optgroup>
          </turf-select>
        </div>
      </div>
      <div v-if="model.source === 'raw'" class="col-xs-12">
        <div class="form-group">
          <label>Type raw value</label>
          <textarea
            v-model="model.rawValue"
            :disabled="isProcessing"
            class="form-control"
            rows="10"
            :placeholder="rawValuePlaceholder"
          />
        </div>
      </div>
      <div class="col-xs-12">
        <div class="form-group">
          <label>Rule for reach metric</label>
          <div class="input-group" :style="{width: '100%'}">
            <turf-select v-model="model.conversionMethod" :disabled="isProcessing" :style="{width: 'auto'}">
              <option v-for="{key, text} in conversionMethods" :key="key" :value="key">
                {{ text.match(/(?:(([A-Z]|)[a-z]+)+?)/g).map(i => i[0].toUpperCase() + i.substr(1)).join(' ') }}
              </option>
            </turf-select>
            <input
              v-model.number="model.cutoffValue"
              :disabled="isProcessing"
              class="form-control"
              placeholder="Cutoff value"
              type="number"
            >
          </div>
        </div>
      </div>
      <div v-if="sourceObject" class="col-xs-12">
        <label>Preview of data ({{ previewBounds[0] }}x{{ previewBounds[1] }})</label>
        <div :style="{overflowX: 'auto'}">
          <table class="table table-bordered table-hover table-condensed">
            <tbody>
              <tr v-for="(row, index) in previewContent" :key="index">
                <td v-for="(col, subIndex) in row" :key="subIndex">
                  <code>
                    {{ col }}
                  </code>
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
  name: 'CalculationForm',
  props: {
    id: String,
  },
  data() {
    return {
      progress: 0,
      isProcessing: false,

      previewContent: null,
      previewBounds: [0, 0],

      rawValuePlaceholder: Array(5).fill(null).map(
        () => Array(10).fill(null).map(() => Math.round(Math.random() * 10)).join(', '),
      ).join('\n'),

      model: {
        source: 'a',
        conversionMethod: 'top',
        cutoffValue: 1,
        rawValue: '',
      },
      sources: [
        {
          key: 'a',
          text: 'Test case A',
          getContent: () => A,
          group: 'Presets',
        },
        {
          key: 'b',
          text: 'Test case B',
          getContent: () => B,
          group: 'Presets',
        },
        {
          key: 'c',
          text: 'Test case C',
          getContent: () => C,
          group: 'Presets',
        },
        {
          key: 'raw',
          text: 'Paste Data from Excel',
          getContent: () => (this.model.rawValue).split('\n').map((row) => row.split(',').map((value) => +(value.trim()))),
          group: 'Other',
        },
      ],
      conversionMethods: Object.keys(TurfAnalysis.getConversionMethods()).map((key) => ({
        key,
        text: key,
      })),
    };
  },
  computed: {
    calculation() {
      return this.id ? (this.$store.getters.calculationsMap[this.id] || null) : null;
    },
    sourcesGroups() {
      return this.sources.reduce((previous, source) => ({
        ...previous,
        [source.group]: source.group in previous ? ([
          ...previous[source.group],
          source,
        ]) : [source],
      }), {});
    },
    sourceObject() {
      const source = this.sources.find(({ key }) => key === this.model.source);

      return source || null;
    },
  },
  watch: {
    id: {
      immediate: true,
      async handler() {
        await this.$nextTick;
        this.$set(this, 'model', this.id ? {
          ...this.calculation.model,
        } : {
          source: 'a',
          conversionMethod: 'top',
          cutoffValue: 1,
          rawValue: '',
        });

        this.calculatePreview();
      },
    },
    'model.rawValue': async function () {
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

      const id = this.id || Math.random().toString(36).substr(7);
      this.$store.commit(this.id ? 'updateCalculation' : 'addCalculation', {
        id,
        model: this.model,
        result: response,
      });

      if (!this.id) {
        await this.$router.push({ params: { id } });
      }

      this.isProcessing = false;
    },
    async calculatePreview() {
      const content = await this.sourceObject.getContent();
      this.previewContent = content.slice(0, 5).map((row) => row.slice(0, 10));
      this.previewBounds = [content.length, content.length ? content[0].length : '-'];
    },
  },
};
</script>
