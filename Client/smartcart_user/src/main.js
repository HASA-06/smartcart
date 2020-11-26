import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import axios from 'axios';
import cookie from 'vue-cookie';
import infiniteScroll from 'vue-infinite-scroll';
import VueBarcode from 'vue-barcode';
import BootPay from 'bootpay-js';
import moment from 'moment';
import VueMomentJS from 'vue-momentjs';

Vue.prototype.$axios = axios;
Vue.prototype.$BootPay = BootPay;

Vue.use(cookie);
Vue.use(infiniteScroll);
Vue.use(VueMomentJS, moment);

import CustomInputComponent from './components/CustomInput'
import CustomButtonComponent from './components/CustomButton'

Vue.component('custom-input', CustomInputComponent);
Vue.component('custom-button', CustomButtonComponent);
Vue.component('barcode', VueBarcode);

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
