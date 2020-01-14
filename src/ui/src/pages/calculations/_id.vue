<template>
  <div>
    <CalculationForm :id="id" />
  </div>
</template>

<script>

import CalculationForm from '@/containers/CalculationForm';

export default {
  name: 'PageCalculationsId',
  components: { CalculationForm },
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
