import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import DemoApp from './DemoApp.vue'
import Draggable from 'vuedraggable'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Swatches from 'vue-swatches'
import moment from 'moment'
import 'vue-swatches/dist/vue-swatches.min.css'
Vue.prototype.moment = moment
Vue.use(Vuetify)
Vue.use(VueAxios, axios)

Vue.component('swatches', Swatches)
Vue.component('draggable', Draggable)

new Vue({
  el: '#app',
  devtool: 'source-map',
  components: {DemoApp},
  render: h => h('demo-app')
})
