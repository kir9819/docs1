<template>
<v-app>
  <v-container>
    <p @click="home()" class="text-xs-center display-2 black-text">EXISTEND DOCS</p>
    <!-- <slot></slot> -->
    <router-view/>
  </v-container>
</v-app>
</template>

<script>
  // import VLink from '../components/VLink.vue'

  export default {
    name: 'Main',
    components: {
      // VLink
    },
    methods: {
      home () {
        this.$router.push('/');
      }
    }
  }
</script>

