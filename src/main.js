// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueLocalStorage from 'vue-localstorage';
import VueSweetalert2 from 'vue-sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'ionicons/dist/css/ionicons.min.css';

import App from './App';
import router from './router';

Vue.use(VueLocalStorage);
Vue.use(VueSweetalert2);
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
