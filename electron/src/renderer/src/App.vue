<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
// Main app component - just renders router views
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}

/* Hide scrollbar for all elements */
::-webkit-scrollbar {
  display: none;
}

#app {
  width: 100vw;
  height: 100vh;
}
</style>
