<template>
  <turf-layout
    logo-url="/logo-side-small.png"
    :title="$store.getters['title']"
  >
    <turf-sidebar slot="sidebar" :items="navigation" />
    <router-view />
  </turf-layout>
</template>

<script>
export default {
  name: 'App',
  computed: {
    navigation() {
      return [
        {
          key: 'create',
          route: {
            name: 'calculations-id',
            params: { id: 'new' },
          },
          label: 'New calculation',
          icon: 'plus',
        },
        ...this.$store.getters.calculations.map(({ id }) => ({
          key: id,
          route: {
            name: 'calculations-id',
            params: { id },
          },
          label: `#${id}`,
          icon: 'dot-circle',
        })),
      ];
    },
  },
};
</script>

<style lang="scss">
  // Fixes
  .input-group > .select2-container--bootstrap {
    display: table-cell;
  }

</style>
