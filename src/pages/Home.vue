<template>
  <main-layout>
    <v-content>
      <div v-if="Docs">
        <div v-for="doc in Docs" v-bind:key="doc.sha">
          <div v-if="doc.name.substring(0,4) === '[ru]'">
            <vue-markdown :source="doc.textname"></vue-markdown>
            <div 
              v-for="doc1 in Docs" 
              v-if="doc1.name.substring(4) === doc.name.substring(4) 
                && doc1.name.substring(0,4) === '[en]'"
                v-bind:key="doc1.sha"
            >{{ doc1.textname }}
            <button @click="showDoc(doc1)">Open</button></div>
            <button @click="showDoc(doc)">Открыть</button>
          </div>
        </div>
      </div>        
      <v-layout row justify-center>
        <v-dialog v-model="dialog" >
          <v-card>
            <v-card-title>
              <h1>{{ text }}</h1>
              <v-btn
                @click="changeLang(lang)"
                color="green darken-1"
                flat="flat"
              >{{ lang }}</v-btn>
            </v-card-title>
            <v-card-text>
              <vue-markdown :source="md"></vue-markdown>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-content>
  </main-layout>
</template>

<script>
  import MainLayout from '../layouts/Main.vue'
  import VueMarkdown from 'vue-markdown'

  function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

  export default {
    data () {
      return {
        myGitHubData: {},
        dialog: false,
        text: '',
        name: '',
        md: '',
        ch: false,
        lang: 'ru'
      }        
    },
    components: {
      MainLayout,
      VueMarkdown
    },
    mounted () {
      console.log("home");

      this.GitHubAPI.get('repos/kir9819/template/contents/d/', {}, response => {
        this.myGitHubData.repositories = response.body;
        let i = 0;
        this.myGitHubData.repositories.forEach(element => {
          this.GitHubAPI.get('repos/kir9819/template/contents/d/' + element.name, {}, res => {
            let title = b64DecodeUnicode(res.body.content);
            element.textname = title.substring(0, title.indexOf("\n"));
            element.text = title.substring(title.indexOf("\n"));
            i++;
            if (i === this.myGitHubData.repositories.length - 1) {
              this.ch = true;
            }
          })
        })
      })

    },
    methods: {            
      showDoc(doc) {
        this.dialog = true;
        this.text = doc.textname;
        this.md = doc.text;
        this.name = doc.name;
      },
      changeLang(lang) {
        let l = lang === 'ru' ? 'en' : 'ru';
        this.Docs.forEach(el => {
          if (el.name === '[' + l + ']' + this.name.substring(4)) {
            this.text = el.textname;
            this.md = el.text;
            this.name = el.name;
            this.lang = l;
          }
        })
      }
    },
    computed: {
      repositoriesCount: function () {
        console.log(this.ch);
        if (this.myGitHubData.repositories) {
          return this.myGitHubData.repositories.length
        }
        return 'Загрузка...'
      },
      Docs: function ()  {
        console.log(this.ch);
        if (this.myGitHubData.repositories) {
          return this.myGitHubData.repositories;
        }
        return null;
      }
    }
  }
</script>
