<template>
<v-app>
  <v-container>
    <p class="text-xs-center display-2">EXISTEND DOCS</p>
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

