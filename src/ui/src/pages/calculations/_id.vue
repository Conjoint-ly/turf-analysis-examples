<template>
  <div>
    <CalculationForm :id="id" />
    <div v-if="id">
      <Simulations class="in" v-bind="experiment" />
    </div>
  </div>
</template>

<script>
import Simulations from '@conjointly/turf-analysis-ui/templates/new/components/simulations';
import CalculationForm from '@/containers/CalculationForm';

export default {
  name: 'PageCalculationsId',
  components: { CalculationForm, Simulations },
  data() {
    return {
      experiment: {
        experimentId: 752,
        isMaxDiff: '',
        segments: [{
          id: 362,
          experiment_id: 752,
          name: 'Segment HFKP',
          hash_respondents: 'ee52bfdf1fd549e656cd2c0d93ba7c79d82082f6c1c23c7ab5fb9f8bedf0675b',
          need_regenerate: 1,
          uuid: '6885fc4f-5ed4-4ca1-95a9-34d55036f997',
          conditions: {
            type: 'group',
            operator: 'AND',
            children: [{
              type: 'rule',
              rule: 'conditions',
              inputs: {
                operator: {
                  variableType: 'question', variable: '2', matchType: 'select', values: ['1'],
                },
              },
            }, {
              type: 'rule',
              rule: 'conditions',
              inputs: {
                operator: {
                  variableType: 'respondent', variable: 'locationCountry', matchType: 'select', values: ['United States'],
                },
              },
            }],
          },
        }, {
          id: 363,
          experiment_id: 752,
          name: 'Segment HHCY',
          hash_respondents: 'ee52bfdf1fd549e656cd2c0d93ba7c79d82082f6c1c23c7ab5fb9f8bedf0675b',
          need_regenerate: 1,
          uuid: '8baab8f1-0cd8-4207-9d6f-6083cffb71ca',
          conditions: {
            type: 'group',
            operator: 'AND',
            children: [{
              type: 'rule',
              rule: 'conditions',
              inputs: {
                operator: {
                  variableType: 'question', variable: '2', matchType: 'select', values: ['1'],
                },
              },
            }, {
              type: 'rule',
              rule: 'conditions',
              inputs: {
                operator: {
                  variableType: 'respondent', variable: 'locationCountry', matchType: 'select', values: ['United States'],
                },
              },
            }],
          },
        }],
        attributes: [{
          id: 6178,
          experiment_id: 752,
          name_short: "Engine' capacity",
          name: 'Engine capacity',
          name_on: 0,
          description: '',
          description_on: 0,
          description_view_mode: 'bottom',
          AseqNum: 1,
          type: 'feature',
          hidden_for_template: null,
          uuid: '587f3e81-a1e3-4286-9330-191d725bb6b1',
          levels: [{
            id: 19312, name_short: '1.5L', name: '1.5L', name_on: 0, description: '', description_on: 0, description_view_mode: 'bottom', group: null, baseline: null, hidden_for_template: null, picture: null, viewMode: null, experiment_id: 752, value: 0, AseqNum: 1, LseqNum: 1, pictureWidth: null, pictureHeight: null, uuid: 'fe0460ac-a061-4625-94ee-7821e2c6230b',
          }, {
            id: 19313, name_short: '1.8L', name: '1.8L', name_on: 0, description: '', description_on: 0, description_view_mode: 'bottom', group: null, baseline: null, hidden_for_template: null, picture: null, viewMode: null, experiment_id: 752, value: 0, AseqNum: 1, LseqNum: 2, pictureWidth: null, pictureHeight: null, uuid: 'd60ad73e-f744-4973-b64f-9855c7de7df7',
          }, {
            id: 19314, name_short: '2L', name: '2L', name_on: 0, description: '', description_on: 0, description_view_mode: 'bottom', group: null, baseline: null, hidden_for_template: null, picture: null, viewMode: null, experiment_id: 752, value: 0, AseqNum: 1, LseqNum: 3, pictureWidth: null, pictureHeight: null, uuid: '272b04f2-3280-4771-9367-6e2db19ea914',
          }],
        }, {
          id: 6179,
          experiment_id: 752,
          name_short: 'Size"',
          name: 'Size',
          name_on: 0,
          description: '',
          description_on: 0,
          description_view_mode: 'bottom',
          AseqNum: 2,
          type: 'feature',
          hidden_for_template: null,
          uuid: '08cdbf71-a208-4fc9-90e4-29afcb8db9c2',
          levels: [{
            id: 19315, name_short: 'Small', name: 'Small', name_on: 0, description: '', description_on: 0, description_view_mode: 'bottom', group: null, baseline: null, hidden_for_template: null, picture: null, viewMode: null, experiment_id: 752, value: 0, AseqNum: 2, LseqNum: 1, pictureWidth: null, pictureHeight: null, uuid: 'a8368b40-11d7-4037-b24f-bdb6d334a30e',
          }, {
            id: 19316, name_short: 'Medium', name: 'Medium', name_on: 0, description: '', description_on: 0, description_view_mode: 'bottom', group: null, baseline: null, hidden_for_template: null, picture: null, viewMode: null, experiment_id: 752, value: 0, AseqNum: 2, LseqNum: 2, pictureWidth: null, pictureHeight: null, uuid: '6b97841e-5823-44d6-8323-8c1e167b66a0',
          }, {
            id: 19317, name_short: 'Large', name: 'Large', name_on: 0, description: '', description_on: 0, description_view_mode: 'bottom', group: null, baseline: null, hidden_for_template: null, picture: null, viewMode: null, experiment_id: 752, value: 0, AseqNum: 2, LseqNum: 3, pictureWidth: null, pictureHeight: null, uuid: 'f7804a2f-8fdd-4415-b767-ce0ebacabffc',
          }],
        }, {
          id: 6180,
          experiment_id: 752,
          name_short: 'Price',
          name: 'Price',
          name_on: 0,
          description: '',
          description_on: 0,
          description_view_mode: 'bottom',
          AseqNum: 3,
          type: 'price',
          hidden_for_template: null,
          uuid: '9808a360-7c03-4bd7-beb7-bcca7bbbaa3e',
          levels: [{
            id: 19318, name_short: '$19,950', name: '$19,950', name_on: 0, description: '', description_on: 0, description_view_mode: 'bottom', group: null, baseline: null, hidden_for_template: null, picture: null, viewMode: null, experiment_id: 752, value: 19950, AseqNum: 3, LseqNum: 1, pictureWidth: null, pictureHeight: null, uuid: '208f0c9e-18e0-432f-8191-7df16b735b21',
          }, {
            id: 19319, name_short: '$25,000', name: '$25,000', name_on: 0, description: '', description_on: 0, description_view_mode: 'bottom', group: null, baseline: null, hidden_for_template: null, picture: null, viewMode: null, experiment_id: 752, value: 25000, AseqNum: 3, LseqNum: 2, pictureWidth: null, pictureHeight: null, uuid: '2a7b9166-a39a-46cc-84b8-bc89ed7a6aa3',
          }, {
            id: 19320, name_short: '$31,200', name: '$31,200', name_on: 0, description: '', description_on: 0, description_view_mode: 'bottom', group: null, baseline: null, hidden_for_template: null, picture: null, viewMode: null, experiment_id: 752, value: 31200, AseqNum: 3, LseqNum: 3, pictureWidth: null, pictureHeight: null, uuid: 'c8cc030a-22d4-4c92-9dc1-401e18076da8',
          }],
        }, {
          id: 6181,
          experiment_id: 752,
          name_short: 'Heating',
          name: 'Heating',
          name_on: 0,
          description: '',
          description_on: 0,
          description_view_mode: 'bottom',
          AseqNum: 4,
          type: 'feature',
          hidden_for_template: null,
          uuid: '2211d13c-1569-45fe-9027-645440b69d97',
          levels: [{
            id: 19321, name_short: 'No heating', name: 'No heating', name_on: 0, description: '', description_on: 0, description_view_mode: 'bottom', group: null, baseline: null, hidden_for_template: null, picture: null, viewMode: null, experiment_id: 752, value: 0, AseqNum: 4, LseqNum: 1, pictureWidth: null, pictureHeight: null, uuid: '03ca0cd7-54e6-4c3c-acdd-91d2adee8f0d',
          }, {
            id: 19322, name_short: 'Broken heating', name: 'Broken heating', name_on: 0, description: '', description_on: 0, description_view_mode: 'bottom', group: null, baseline: null, hidden_for_template: null, picture: null, viewMode: null, experiment_id: 752, value: 0, AseqNum: 4, LseqNum: 2, pictureWidth: null, pictureHeight: null, uuid: 'cff0ae0e-7e09-4f3f-b6d7-ee90da89aa12',
          }, {
            id: 19323, name_short: 'Working heating', name: 'Working heating', name_on: 0, description: '', description_on: 0, description_view_mode: 'bottom', group: null, baseline: null, hidden_for_template: null, picture: null, viewMode: null, experiment_id: 752, value: 0, AseqNum: 4, LseqNum: 3, pictureWidth: null, pictureHeight: null, uuid: '24a5c650-c950-4a3e-8bc9-747ef4c6f3a3',
          }],
        }],
        applicability: [],
        initWorksheets: [{
          id: '45C9H9W30VI9N',
          name: 'Worksheet 1',
          scenarios: [{
            id: 'BW2ZC4C30EKTQ',
            name: 'Scenario 1',
            show: true,
            segment: 0,
            price: null,
            productType: 'sop',
            concepts: [{
              id: '5N0TDTXZZAY1T',
              name: 'Product concept VIJZ',
              show: true,
              color: '#204586',
              adjustedPreferenceShare: 0.49749142,
              simulatedPreferenceShare: 0.49749142,
              actualMarketShare: 0.51736162,
              relativeAvailability: 0,
              revenue: 9924953.829,
              attributes: {
                A1: 'A1L3', A2: 'A2L2', A3: 19950, A4: 'A4L3',
              },
            }, {
              id: 'QV5D3VRCPQOZ2',
              name: 'Product concept UMXH',
              show: true,
              color: '#e7260d',
              adjustedPreferenceShare: 0.50250858,
              simulatedPreferenceShare: 0.50250858,
              actualMarketShare: 0.48263838,
              relativeAvailability: 0,
              revenue: 10025046.171,
              attributes: {
                A1: 'A1L1', A2: 'A2L2', A3: 19950, A4: 'A4L3',
              },
            }],
          }, {
            id: 'K25EURLURIXJK',
            name: 'Scenario 1 — Product concept UMXH [ $25,000 ]',
            show: true,
            segment: 0,
            price: null,
            productType: 'sop',
            concepts: [{
              id: 'K25EURLUL8R36',
              name: 'Product concept VIJZ',
              show: true,
              color: '#204586',
              adjustedPreferenceShare: 0.68168134,
              simulatedPreferenceShare: 0.68168134,
              actualMarketShare: 0.71778698,
              relativeAvailability: 0,
              revenue: 13599542.733,
              attributes: {
                A1: 'A1L3', A2: 'A2L2', A3: 19950, A4: 'A4L3',
              },
            }, {
              id: 'K25EURLUML9F5',
              name: 'Product concept UMXH',
              show: true,
              color: '#e7260d',
              adjustedPreferenceShare: 0.31831866,
              simulatedPreferenceShare: 0.31831866,
              actualMarketShare: 0.28221302,
              relativeAvailability: 0,
              revenue: 7957966.5,
              attributes: {
                A1: 'A1L1', A2: 'A2L2', A3: 25000, A4: 'A4L3',
              },
            }],
          }, {
            id: 'K25EURLZKVIZN',
            name: 'Scenario 1 — Product concept UMXH [ $31,200 ]',
            show: true,
            segment: 0,
            price: null,
            productType: 'sop',
            concepts: [{
              id: 'K25EURLZ7F6J5',
              name: 'Product concept VIJZ',
              show: true,
              color: '#204586',
              adjustedPreferenceShare: 0.81237305,
              simulatedPreferenceShare: 0.81237305,
              actualMarketShare: 0.84145232,
              relativeAvailability: 0,
              revenue: 16206842.3475,
              attributes: {
                A1: 'A1L3', A2: 'A2L2', A3: 19950, A4: 'A4L3',
              },
            }, {
              id: 'K25EURLZKCUHV',
              name: 'Product concept UMXH',
              show: true,
              color: '#e7260d',
              adjustedPreferenceShare: 0.18762695,
              simulatedPreferenceShare: 0.18762695,
              actualMarketShare: 0.15854768,
              relativeAvailability: 0,
              revenue: 5853960.84,
              attributes: {
                A1: 'A1L1', A2: 'A2L2', A3: 31200, A4: 'A4L3',
              },
            }],
          }, {
            id: 'K25EV1BKD3M76',
            name: '- Product concept VIJZ',
            show: true,
            segment: 0,
            price: null,
            productType: 'sop',
            concepts: [{
              id: 'K25EV1BK2E5RK',
              name: 'Product concept UMXH',
              show: true,
              color: '#e7260d',
              adjustedPreferenceShare: 0,
              simulatedPreferenceShare: 0,
              actualMarketShare: 0,
              relativeAvailability: 0,
              revenue: 0,
              attributes: {
                A1: 'A1L1', A2: 'A2L2', A3: 31200, A4: 'A4L3',
              },
            }],
          }, {
            id: 'K25EV1UAMLVTI',
            name: '+ Product concept VIJZ',
            show: true,
            segment: 0,
            price: null,
            productType: 'sop',
            concepts: [{
              id: 'K25EV1UA7EI65',
              name: 'Product concept VIJZ',
              show: true,
              color: '#204586',
              adjustedPreferenceShare: 0.81237305,
              simulatedPreferenceShare: 0.81237305,
              actualMarketShare: 0.84145232,
              relativeAvailability: 0,
              revenue: 16206842.3475,
              attributes: {
                A1: 'A1L3', A2: 'A2L2', A3: 19950, A4: 'A4L3',
              },
            }, {
              id: 'K25EV1UACAJ8T',
              name: 'Product concept UMXH',
              show: true,
              color: '#e7260d',
              adjustedPreferenceShare: 0.18762695,
              simulatedPreferenceShare: 0.18762695,
              actualMarketShare: 0.15854768,
              relativeAvailability: 0,
              revenue: 5853960.84,
              attributes: {
                A1: 'A1L1', A2: 'A2L2', A3: 31200, A4: 'A4L3',
              },
            }],
          }],
          type: 'what-if',
          revenues: {
            K4NHVZKD7WYCW: {
              id: 'K4NHVZKD7WYCW', title: 'New revenue calculation', xAxisTitle: 'Revenue projections (assuming 1,000 units offered)', formulas: { 'Product concept VIJZ': 'share * price * 10000', 'Product concept UMXH': 'share * price * 10000' },
            },
          },
        }, {
          id: 'K2PBL9WOB3HJ9',
          type: 'source-of-business',
          name: 'Investigate source of business',
          scenarios: [{
            name: 'Source of business 2', newWorksheetId: '45C9H9W30VI9N', newScenarioId: 'BW2ZC4C30EKTQ', baselineWorksheetId: '45C9H9W30VI9N', baselineScenarioId: 'K25EURLZKVIZN', id: 'K2PBLE50OQ4WF',
          }, {
            name: 'Source of business', newWorksheetId: '45C9H9W30VI9N', newScenarioId: 'BW2ZC4C30EKTQ', baselineWorksheetId: '45C9H9W30VI9N', baselineScenarioId: 'K25EURLURIXJK',
          }, {
            name: 'Source of business 3', newWorksheetId: '45C9H9W30VI9N', newScenarioId: 'K25EURLURIXJK', baselineWorksheetId: '45C9H9W30VI9N', baselineScenarioId: 'BW2ZC4C30EKTQ', id: 'K2PBLIGZCZSV4',
          }, {
            name: 'Source of business 4', newWorksheetId: '45C9H9W30VI9N', newScenarioId: 'K25EURLZKVIZN', baselineWorksheetId: '45C9H9W30VI9N', baselineScenarioId: 'K25EURLURIXJK', id: 'K2PBLQ4M1S50Y',
          }],
        }],
        experimentType: 'generic',
        csrfToken: '08397a18fbe302aa840ac0b995903822f379a8af49eaaa2a1e4a563d38db68cc7d8238733d3d37cf8a3fff9e99de79dd423b00136d35badc6454a6bdd2d86fd2',
        priceObject: { min: 18825, max: 32325, step: 1 },
      },
    };
  },
  computed: {
    id() {
      const { id } = this.$route.params;
      return id === 'new' ? null : id;
    },
  },
  watch: {
    id: {
      immediate: true,
      async handler(id) {
        this.$store.commit('setTitle', id ? `Calculation #${id}` : 'Create new calculation');
      },
    },
  },
  async created() {
    if (this.id && !(this.id in this.$store.getters.calculationsMap)) {
      await this.$router.push({ params: { id: 'new' } });
    }
  },
};
</script>
