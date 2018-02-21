<template>
<v-app>
  <v-container>
    <v-btn href="/docs1">Home</v-btn>
    <slot></slot>
  </v-container>
</v-app>
</template>

<script>
  import VLink from '../components/VLink.vue'

  export default {
    components: {
      VLink
    }
  }
</script>

<style scoped>
  /* .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 15px 30px;
    background: #f9f7f5;

  }
  img {
    width: 100% !important;
  } */
</style>
