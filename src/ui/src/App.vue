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
  data() {
    return {
      navigation: [
        {
          key: 'create',
          route: {
            name: 'calculations-id',
            params: { id: 'new' },
          },
          label: 'New calculation',
          icon: 'plus',
        },
      ],
    };
  },
};
</script>
