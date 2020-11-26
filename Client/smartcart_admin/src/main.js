import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import axios from 'axios';
import cookie from 'vue-cookie'
import infiniteScroll from 'vue-infinite-scroll'
import VueBarcodeScanner from 'vue-barcode-scanner'

Vue.prototype.$axios = axios;

Vue.use(cookie);
Vue.use(infiniteScroll);
Vue.use(VueBarcodeScanner)

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
