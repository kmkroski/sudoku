<template>
  <div id="app">
    <router-view :key="$route.fullPath"/>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style scoped>
  #app {
    max-width: 600px;
    margin: 0 auto;
  }
</style>
