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
          <v-flex xs10 sm5>
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
          <v-flex xs10 sm4>
            <v-select
              :items="tags"
              :label="searchTagText"
              item-text="name"
              item-value="name"
              v-model="searchTag"
              chips
              multiple
              autocomplete
              prepend-icon="search"
              :append-icon="searchTag.length > 0 ? 'clear' : ''"
              :append-icon-cb="() => searchTag = []"
            >
              <template slot="selection" slot-scope="data">
                <v-chip
                  close
                  small
                  @input="data.parent.selectItem(data.item)"
                  :selected="data.selected"
                  class="chip--select-multi"
                  :key="JSON.stringify(data.item)"
                > {{data.item}} </v-chip>
              </template>
              <template slot="item" slot-scope="data">
                <template v-if="typeof data.item !== 'object'">
                  <v-list-tile-content v-text="data.item"></v-list-tile-content>
                </template>
                <template v-else>
                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item"></v-list-tile-title>
                  </v-list-tile-content>
                </template>
              </template>
            </v-select>
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
              <v-list-tile >
                <v-list-tile-content>
                  <v-list-tile-title><a @click="showDoc(doc)">{{doc.textname}}</a></v-list-tile-title>
                  <v-list-tile-sub-title>
                    <div v-if="(doc.tags)">
                      <v-chip v-for="tag in doc.tags" 
                        :key="tag"
                        @click="searchOfTag(tag)"
                        color='light-blue lighten-3'
                        class="caption"
                        small 
                      >
                        {{ tag }}
                      </v-chip>
                    </div>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
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
      id="dialog"
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
        <v-card-text id="md">
          <v-flex xs12 sm10 offset-sm1 class="hidden-md-and-up">
            <p class="title">{{ text }}</p>
          </v-flex>
          <v-flex xs12 sm10 md8 offset-sm1 offset-md2>
            <vue-markdown class="markdown-body" :source="md"></vue-markdown>
          </v-flex>
        </v-card-text>
      </v-card>
    </v-dialog>
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
        pSearch: false,
        tags: [],
        searchTag: []
      }
    },
    components: {
      VueMarkdown
    },
    mounted () {
      // проверка всех элементов локального хранилища
      for (let i = 0; i < localStorage.length; i++) {
        let LSelement = localStorage.key(i);
        // проверка на документ
        if (LSelement.substring(0,4) === '[ru]' 
          || LSelement.substring(0,4) === '[en]') {
          let item = JSON.parse(localStorage.getItem(LSelement));
          // проверка на наличие необходимых данных
          if (item.textname && item.text && item.sha && item.shows) {
            // проверка на присутствие тегов
            if (item.tags) {
              item.tags.forEach(tag => {
                // добавление тега в глобальный массив, если тег ещё не там
                if (!~this.tags.slice().indexOf(tag.toLowerCase())) {
                  this.tags.push(tag.toLowerCase());
                }
              })
            }
            // добавление документа в массив документов
            this.myGitHubData.push(item);
          }
          // если у документа текущий язык (по умолч. русский), то убираем
          // показ надписи "Загрузка.."
          if (LSelement.substring(1,3) === this.gLang) {
            this.pLoad = false;
          }
        }
      }
      // получение списка всех документов репозитория GitHub
      this.GitHubAPI.get(url, {}, response => {
        // отсчёт загруженных документов, чтобы своевременно скрыть полосу 
        // загрузки
        let i = 0;
        response.body.forEach(element => {
          if (i === response.body.length - 1) {
            this.progress = false;
          }
          // флаг на необходимость отдельной загрузки документа с GitHub
          // (true значит, что документ успешно получен с локального хранилища)
          let flag = false;
          // проверка на наличие в массиве документов
          if (this.myGitHubData.length > 0) {
            this.myGitHubData.forEach(el => {
              // проверка совпадения имени
              if (el.name === element.name) {
                // если файл был изменён, то его хэш будет другой, но имя
                // останется тем же, проверка этого
                if (el.sha === element.sha) {
                  // документ успешно добавлен с локального хранилища 
                  i++;
                  if (i === response.body.length - 1) {
                    this.progress = false;
                  }
                  flag = true;
                } 
                else {
                  // так как не совпадает хэш, необходимо обновить все данные
                  // документа
                  this.GitHubAPI.get(url + el.name, {}, res => {
                    let title = b64DecodeUnicode(res.body.content); 
                    element.textname = title.substring(0, title.indexOf("\n"));
                    title = title.substring(title.indexOf("\n") + 1);
                    // проверка на присутствие тегов и работа с ними
                    if (title.substring(0, 5).toLowerCase() === 'tags:') {
                      let tags = title.substring(5, title.indexOf("\n"))
                                      .split(',')
                                      .sort();
                      element.tags = [];
                      tags.forEach(tag => {
                        // убираем лишние пробелы
                        while (tag.substring(0,1) === ' ') {
                          tag = tag.substring(1);
                        }
                        // добавление тега в глобальный массив, если тег ещё 
                        // не там
                        if (!~this.tags.slice().indexOf(tag.toLowerCase())) {
                          this.tags.push(tag.toLowerCase());
                        }
                        // добавление тега в свойство tags
                        element.tags.push(tag);
                      })
                      // добавление остального текста в свойство text
                      element.text = title.substring(title.indexOf("\n"));
                    }
                    // если тегов нет, просто добавляем текст в свойство text
                    else {
                      element.text = title;
                    }
                    // сохраняем хэш элемента (при перезагрузке страницы 
                    // проверяем хэш у файла с локального хранилища и у файла
                    // из списка, полученного с GitHub => быстрее загружается
                    // сайт)
                    el.sha = res.body.sha;
                    // настройка показа элемента на странице (меняется в 
                    // зависимости от поиска)
                    el.shows = true;
                    // если у документа текущий язык (по умолч. русский), то
                    // убираем показ надписи "Загрузка.."
                    if (el.name.substring(1,3) === this.gLang) {
                      this.pLoad = false;
                    }
                    // проверка на наличие документа в локальном хранилище
                    if (localStorage.getItem(el.name)) {
                      localStorage.removeItem(el.name);
                    }
                    // сохранение документа в локальное хранилище 
                    // (в формате json)
                    localStorage.setItem(el.name, JSON.stringify(el));
                    // файл успешно обновлён
                    i++;
                    if (i === response.body.length - 1) {
                      this.progress = false;
                    }
                    flag = true;
                  }, err => {
                    // обработка ошибок ¯\_(ツ)_/¯
                  })
                }
              }
            });
          }
          if (!flag) {
            // получение документа с GitHub
            this.GitHubAPI.get(url + element.name, {}, res => { 
              // раскодирование
              let title = b64DecodeUnicode(res.body.content); 
              // получение первой строчки - заголовка
              element.textname = title.substring(0, title.indexOf("\n")); 
              title = title.substring(title.indexOf("\n") + 1);
              // проверка на присутствие тегов и работа с ними
              if (title.substring(0, 5).toLowerCase() === 'tags:') {
                let tags = title.substring(5, title.indexOf("\n"))
                                .split(',')
                                .sort();
                element.tags = [];
                tags.forEach(tag => {
                  // убираем лишние пробелы
                  while (tag.substring(0,1) === ' ') {
                    tag = tag.substring(1);
                  }
                  // добавление тега в глобальный массив, если тег ещё не там
                  if (!~this.tags.slice().indexOf(tag.toLowerCase())) {
                    this.tags.push(tag.toLowerCase());
                  }
                  // добавление тега в свойство tags
                  element.tags.push(tag);
                })
                // добавление остального текста в свойство text
                element.text = title.substring(title.indexOf("\n"));
              }
              // если тегов нет, просто добавляем текст в свойство text
              else {
                element.text = title;
              }
              // сохраняем хэш элемента (при перезагрузке страницы проверяем
              // хэш у файла с локального хранилища и у файла из списка, 
              // полученного с GitHub => быстрее загружается сайт)
              element.sha = res.body.sha;
              // настройка показа элемента на странице (меняется в зависимости
              // от поиска)
              element.shows = true;
              // если у документа текущий язык (по умолч. русский), то убираем
              // показ надписи "Загрузка.."
              if (element.name.substring(1,3) === this.gLang) {
                this.pLoad = false;
              }
              // проверка на наличие документа в локальном хранилище 
              if (localStorage.getItem(element.name)) { 
                localStorage.removeItem(element.name) 
              }
              // сохранение документа в локальное хранилище (в формате json)
              localStorage.setItem(element.name, JSON.stringify(element));
              // добавление документа в массив документов
              this.myGitHubData.push(element);
              // файл успешно загружен
              i++;
              if (i === response.body.length - 1) {
                this.progress = false;
              }
            }, err => {
              // обработка ошибок ¯\_(ツ)_/¯
            })
          }
        })
      }, err => {
        // обработка ошибок ¯\_(ツ)_/¯
      })
    },
    methods: {
      // функция показа документа, присваиваем глобальным переменным нужные
      // значения и открываем окно диалога
      // CHANGED открываем вкладку с документом
      showDoc(doc) {
        this.$router.push({name: 'Doc', params: {name : doc.name.substring(0, doc.name.length - 3)}});
        // this.text = doc.textname;
        // this.md = doc.text;
        // this.name = doc.name;
        // this.lang = this.name.substring(1,3) === 'ru' ? 'ru' : 'en';
        // this.dialog = true;
        // document.getElementById('md').scrollTop = 0;
      },
      // смена языка документа (при просмотре документа)
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
      // смена глобального языка (на котором показываются все документы)
      changeGLang() {
        let l = this.gLang === 'ru' ? 'en' : 'ru';
        this.gLang = l;
      },
      // проверка тегов (для уменьшения количества кода в поиске)
      // первый аргумент - теги документа, второй - теги в поиске
      checkTags(docTags, tags) {
        let ret = true;
        if (!docTags || docTags.length === 0) {
          ret = (!tags || tags.length === 0) ? true : false;
        }
        else if (!tags || tags.length === 0) {
          ret = true;
        } else {
          tags.forEach(tag => {
            if (!~String(docTags.slice())
                               .toLowerCase()
                               .indexOf(tag.toLowerCase())) {
              ret = false;
            }
          })
        }
        return ret;
      },
      // для добавления тега в строку поиска
      searchOfTag(tag) {
        this.searchTag.push(tag);
        this.searchFunc();
      },
      // функция поиска (для избежания повторения одного и того же кода)
      searchFunc() {
        // активация показа элемента с предупреждением, что элемент не найден
        this.pSearch = true;
        let show = true;
        this.myGitHubData.forEach(element => {
          if(this.checkTags(element.tags, this.searchTag) 
            && (~element.text.toLowerCase()
                             .indexOf(this.search.toLowerCase()) 
            || ~element.textname.toLowerCase()
                                .indexOf(this.search.toLowerCase()))) {
            element.shows = true;
            this.pSearch = false;
          }
          else {
            element.shows = false;
          }
        })
      }
    },
    computed: {
      open: function() {
        return this.gLang === 'ru' ? 'Открыть' : 'Open';
      },
      searchText: function() {
        return this.gLang === 'ru' ? 'Поиск..' : 'Search..';
      },
      searchTagText: function() {
        return this.gLang === 'ru' ? 'Поиск по тегам..' : 'Tag search..';
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
        this.searchFunc();
      },
      searchTag: function() {
        this.searchFunc();
      }
    }
  }
</script>

<style scoped>
  a {
    color: black;
  }
  a:hover {
    text-decoration: underline;
  }
</style>

