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
    return {
      doc:''
    }
  },
  mounted () {
    if (window.location.search) {
      this.$router.replace({name: 'Doc', params: {name : '[' + window.location.search.substring(4,6) +']' + window.location.search.substring(9)}})
    }
  }
}
</script>
