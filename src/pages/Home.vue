<template>
  <main-layout>
    <v-flex class="text-xs-center">
      <v-progress-linear row wrap align-center
        :indeterminate="true"
        v-show="progress"
        color="teal"
        ></v-progress-linear>
    </v-flex>
    <v-content v-if="myGitHubData.length > 0">
      <v-container>
        <v-layout row wrap>
          <v-flex xs7 sm5>
            <v-text-field 
              v-model="search" 
              :label="searchText"
              single-line 
              prepend-icon="search"
              :append-icon="search.length > 0 ? 'clear' : ''"
              :append-icon-cb="() => search = ''"
              ></v-text-field>
          </v-flex>
          <v-spacer></v-spacer>
          <v-btn
            @click="changeGLang()"
            light
            flat
            >{{ gLang }}</v-btn>
        </v-layout>
      </v-container>
      <v-list two-line class="elevation-2">
        <p class="text-xs-center" v-show="pLoad">{{ load }}</p>
        <p class="text-xs-center" v-show="pSearch">{{ searchNoResult}}</p>
        <template>
          <v-content 
            v-for="doc in myGitHubData" 
            :key="doc.sha" 
            v-if="doc.name.substring(1,3) === gLang && doc.shows === true"
            >
            <v-slide-y-transition>
              <v-list-tile @click="showDoc(doc)">
                <v-list-tile-content v-text="doc.textname"></v-list-tile-content>
              </v-list-tile>
            </v-slide-y-transition>
            <v-divider v-if="doc"></v-divider>
          </v-content>
        </template>
      </v-list>
    </v-content>
    
    <v-dialog 
      v-model="dialog" 
      fullscreen
      transition="dialog-bottom-transition"
      :overlay="false"
      scrollable
      @keydown.esc="dialog = false"
      >
      <v-card>
        <v-toolbar card dark color="primary">
          <v-btn icon @click.native="dialog = false" dark>
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>{{ text }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              @click="changeLang()"
              dark
              flat
            >{{ lang }}</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-flex xs12 sm10 offset-sm1 class="hidden-md-and-up">
            <h2>{{ text }}</h2>
          </v-flex>
          <v-flex xs12 sm10 md8 offset-sm1 offset-md2>
            <vue-markdown class="markdown-body" :source="md"></vue-markdown>
          </v-flex>
        </v-card-text>
      </v-card>
    </v-dialog>
  </main-layout>
</template>

<script>
  import MainLayout from '../layouts/Main.vue'
  import VueMarkdown from 'vue-markdown'

  const url = 'repos/existend/exi-docs2/contents/files/'

  function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

  export default {
    data () {
      return {
        myGitHubData: [],
        dialog: false,
        text: '',
        name: '',
        md: '',
        lang: 'ru',
        gLang: 'ru',
        search: '',
        progress: true,
        pLoad: true,
        pSearch: false
      }        
    },
    components: {
      MainLayout,
      VueMarkdown
    },
    mounted () {
      this.GitHubAPI.get(url, {}, response => {
        response.body.forEach(element => {
          this.GitHubAPI.get(url + element.name, {}, res => {
            let title = b64DecodeUnicode(res.body.content);
            element.textname = title.substring(0, title.indexOf("\n"));
            element.shows = true;
            element.text = title.substring(title.indexOf("\n"));
            this.progress = false;
            if(element.name.substring(1,3) === this.gLang) {
              this.pLoad = false;
            }
            this.myGitHubData.push(element);
          })
        })
      })

    },
    methods: {            
      showDoc(doc) {
        this.text = doc.textname;
        this.md = doc.text;
        this.name = doc.name;
        this.lang = this.name.substring(1,3) === 'ru' ? 'ru' : 'en';
        this.dialog = true;
      },
      changeLang() {
        let l = this.lang === 'ru' ? 'en' : 'ru';
        this.myGitHubData.forEach(el => {
          if (el.name === '[' + l + ']' + this.name.substring(4)) {
            this.text = el.textname;
            this.md = el.text;
            this.name = el.name;
            this.lang = l;
          }
        })
      },
      changeGLang() {
        let l = this.gLang === 'ru' ? 'en' : 'ru';
        this.gLang = l;
      }
    },
    computed: {
      open: function() {
        return this.gLang === 'ru' ? 'Открыть' : 'Open';
      },
      searchText: function() {
        return this.gLang === 'ru' ? 'Поиск..' : 'Search..';
      },
      searchNoResult: function() {
        return this.gLang === 'ru' ? 'Совпадений не найдено.' : 'No matches found.';
      },
      load: function() {
        return this.gLang === 'ru' ? 'Загрузка..' : 'Loading..';
      }
    },
    watch : {
      search: function() {
        this.pSearch = true;
        this.myGitHubData.forEach(element => {
          if(~element.text.toLowerCase().indexOf(this.search.toLowerCase()) 
            || ~element.textname.toLowerCase().indexOf(this.search.toLowerCase())) {
              element.shows = true;
              this.pSearch = false;
            }
            else {
              element.shows = false;
            }
        })
      }
    }
  }
</script>

