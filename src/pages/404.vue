<template>
  <v-container fluid fill-height>
    <v-layout flex align-center justify-center>
      <v-card class="grey lighten-4">
        <v-card-text class="title pa-5">
          Page not found
        </v-card-text>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data () {

  },
  mounted () {
    console.log(window.location);
    console.log(this.$route.params);
    console.log(window.location.search.substring(9));
    if (window.location.search) {
      this.$router.push({name: 'Doc', params: {name : '[ru]' + window.location.search.substring(9)}})
    }
  }
}
</script>
