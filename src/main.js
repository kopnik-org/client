import './register-error-handlers'
import Vue from 'vue'
import './plugins/vue-the-mask'
import vuetify from './plugins/vuetify'
import routerFactory from './plugins/vue-router'
import i18n from './plugins/i18n'
// import i18n from './plugins/i18next'
import "./plugins/vee-validate"
import "./plugins/vue-promise-button"

import {Icon} from 'leaflet'
import 'leaflet/dist/leaflet.css'
// this part resolve an issue where the markers would not appear
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

import AppVue from './components/KApp/KApp.vue'
import {container} from "./bottle/bottle"
import './plugins/className'
import './sw'

console.log('process.env', process.env)

Vue.config.productionTip = false

global.application = container.application
global.application.authenticate()

global.vm = new Vue({
  ...AppVue,
  el: "#appContainer",
  vuetify,
  i18n,
  router: routerFactory(),
  // render: h => h(App)
})//.$mount('#app')
Vue.config.devtools = true

