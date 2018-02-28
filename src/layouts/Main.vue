<template>
<v-app>
  <v-container>
    <p @click="home()" class="text-xs-center display-2 black-text">EXISTEND DOCS</p>
    <router-view/>
  </v-container>
</v-app>
</template>

<script>
  export default {
    name: 'Main',
    methods: {
      home () {
        this.$router.push('/docs1');
      }
    }
  }
</script>

