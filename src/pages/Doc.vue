<template>
  <v-flex xs12 sm10 md8 offset-sm1 offset-md2>
    <v-progress-linear 
      row 
      wrap 
      align-center
      :indeterminate="true"
      v-show="load"
      color="teal"
    ></v-progress-linear>
    <v-flex v-if="lang1">
      <div class="text-xs-center pt-3">Файл не найден.</div>
      <div class="text-xs-center">Вы будете перенаправлены на главную страницу через</div>
      <div class="text-xs-center">{{ sec }}</div>
    </v-flex>
    <v-card v-if="doc">
      <v-card-text>
        <v-flex v-show="!lang2">
          <v-btn
            @click="changeLang()"
            light
            depressed
          >{{ lang }}</v-btn>
        </v-flex>
        <v-flex>
          <p class="display-1">{{ doc.textname }}</p>
          <v-spacer></v-spacer>
          
        </v-flex>
        <v-flex >
          <vue-markdown class="markdown-body" :source="doc.text"></vue-markdown>
        </v-flex>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
  import VueMarkdown from 'vue-markdown'
  import home from './Home'

  const url = 'repos/existend/exi-docs2/contents/files/'

  function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

  export default {
    name: 'Doc',
    data () {
      return {
        name: '',
        doc: {},
        lang: '',
        text: '',
        md: '',
        load: true,
        lang1: false,
        lang2: true,
        sec: 10
      }
    },
    components: {
      home,
      VueMarkdown
    },
    mounted() {
      document.body.scrollTop;
      this.name = this.$route.params.name + '.md';
      let l = this.name.substring(1,3) === 'ru' ? 'en' : 'ru';
      this.doc = JSON.parse(localStorage.getItem(this.name));
      if (!this.doc) {
        this.GitHubAPI.get(url + this.name, {}, res => {
          let title = b64DecodeUnicode(res.body.content);
          let el = {
            name: res.body.name,
            textname : title.substring(0, title.indexOf("\n")),
            text : title.substring(title.indexOf("\n")),
            shows: true,
            sha: res.body.sha
          }
          localStorage.setItem(this.name, JSON.stringify(el));
          this.load = false;
          this.doc = el;
          this.lang = this.doc.name.substring(1,3);
        }, err => {
          console.log(err);
          this.lang1 = true;
          this.load = false;
          let self = this;
          setInterval(function() {
            self.sec -= 1;
          }, 1000);
          setTimeout(function() { 
            self.$router.push('/');
          }, 10000);
        })
      }
      else {
        this.load = false;
        this.lang = this.name.substring(1,3);
      }

      if(!localStorage.getItem('[' + l + ']' + this.name.substring(4))) {
        this.GitHubAPI.get(url + this.name, {}, res => {
          let title = b64DecodeUnicode(res.body.content);
          let el = {
            textname : title.substring(0, title.indexOf("\n")),
            text : title.substring(title.indexOf("\n")),
            shows: true,
            sha: res.body.sha
          }
          localStorage.setItem(this.name, JSON.stringify(el));
          this.lang2 = false;
        }, err => {
          console.log(err);
          this.lang2 = true;
        })
      }
      else {
        this.lang2 = false;
      }
    },
    methods: {
      changeLang() {
        let l = this.lang === 'ru' ? 'en' : 'ru';
        this.doc = JSON.parse(localStorage.getItem('[' + l + ']' 
          + this.name.substring(4)));
        this.lang = l;
      }
    }
  }
</script>
