import Vue from 'vue'
import App from './App.vue'
import Multiselect from 'vue-multiselect'
import VueFormulate from '@braid/vue-formulate'
import Vuesax from 'vuesax'
import Vuelidate from 'vuelidate'

// css
import 'vue-multiselect/dist/vue-multiselect.min.css'
import './assets/styles.css'
import '@braid/vue-formulate/dist/snow.min.css'
import 'vuesax/dist/vuesax.css'

Vue.config.productionTip = false
Vue.component('multiselect', Multiselect)
Vue.use(VueFormulate)
Vue.use(Vuesax)
Vue.use(Vuelidate)

new Vue({
  render: h => h(App),
}).$mount('#app')
