<template>
  <v-content>
    <v-flex class="text-xs-center">
      <v-progress-linear 
        row 
        wrap 
        align-center
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
              <v-list-tile @click="showDoc(doc)" >
                <v-list-tile-content v-text="doc.textname"></v-list-tile-content>
              </v-list-tile>
            </v-slide-y-transition>
            <v-divider v-if="doc"></v-divider>
          </v-content>
        </template>
      </v-list>
                
    </v-content>
  </v-content>
</template>

<script>
  import VueMarkdown from 'vue-markdown'

  const url = 'repos/existend/exi-docs2/contents/files/'

  function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

  export default {
    name: 'Home',
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
      // MainLayout,
      VueMarkdown
    },
    mounted () {
      for (let i = 0; i < localStorage.length; i++) {
        let n = localStorage.key(i);
        if(n.substring(0,4) === '[ru]' || n.substring(0,4) === '[en]'){
          let item = JSON.parse(localStorage.getItem(n));
          if (item.textname && item.text && item.sha && item.shows) {
            this.myGitHubData.push(item);
          }
          // this.progress = false;
          if (n.substring(1,3) === this.gLang) {
            this.pLoad = false;
          }
        }
      }
      this.GitHubAPI.get(url, {}, response => {
        let i = 0;
        response.body.forEach(element => {
          if (i === response.body.length - 1) {
            this.progress = false;
          }
          let flag = false;
          i++;
          this.myGitHubData.forEach(el => {
            if(el.name === element.name) {
              if (el.sha === element.sha) {
                flag = true;
              } 
              else {
                this.GitHubAPI.get(url + el.name, {}, res => {
                  console.log(1);
                  let title = b64DecodeUnicode(res.body.content);
                  el.textname = title.substring(0, title.indexOf("\n"));
                  el.text = title.substring(title.indexOf("\n"));
                  el.sha = res.body.sha;
                  el.shows = true;
                  if(el.name.substring(1,3) === this.gLang) {
                    this.pLoad = false;
                  }
                  if(localStorage.getItem(el.name)) {
                    console.log('name'); 
                    localStorage.removeItem(el.name);
                  }
                  localStorage.setItem(el.name, JSON.stringify(el));
                  // this.myGitHubData.push(element);
                  flag = true;
                }, err => {
                  
                })
              }
            }
            
          });
          if(!flag) {
            this.GitHubAPI.get(url + element.name, {}, res => {
              let title = b64DecodeUnicode(res.body.content);
              element.textname = title.substring(0, title.indexOf("\n"));
              element.text = title.substring(title.indexOf("\n"));
              element.sha = res.body.sha;
              element.shows = true;
              if(element.name.substring(1,3) === this.gLang) {
                this.pLoad = false;
              }
              if(localStorage.getItem(element.name)) { localStorage.removeItem(element.name) }
              localStorage.setItem(element.name, JSON.stringify(element));
              this.myGitHubData.push(element);
            }, err => {

            })
          }
        })
      }, err => {

      })
    },
    methods: {            
      showDoc(doc) {
        // localStorage.setItem(doc.name, JSON.stringify({
        //   text: doc.textname,
        //   md: doc.text
        // }))
        this.$router.push({name: 'Doc', params: {name : doc.name.substring(0, doc.name.length - 3)}})
        // this.text = doc.textname;
        // this.md = doc.text;
        // this.name = doc.name;
        // this.lang = this.name.substring(1,3) === 'ru' ? 'ru' : 'en';
        // this.dialog = true;
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

<style scoped>

</style>

