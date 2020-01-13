<template>
  <div>
    <CreateCalculationForm />
  </div>
</template>

<script>

import CreateCalculationForm from '@/containers/CreateCalculationForm';

export default {
  name: 'PageCalculationsId',
  components: { CreateCalculationForm },
  created() {
    this.$store.commit('setTitle', 'Create new calculation');
  },
};
</script>
