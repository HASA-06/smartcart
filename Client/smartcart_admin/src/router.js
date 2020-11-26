import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import SignIn from './views/accounts/SignIn.vue';
import AccountRegist from './views/accounts/AccountRegist.vue';
import AccountRead from './views/accounts/AccountRead.vue';
import GoodAdd from './views/goods/GoodAdd.vue';
import GoodRead from './views/goods/GoodRead.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path : '/',
      name : 'Home',
      component : Home
    },
    {
      path : '/accounts/sign-in',
      name : 'SignIn',
      component : SignIn
    },
    {
      path : '/accounts/regist',
      name : 'AccountRegist',
      component : AccountRegist
    },
    {
      path : '/accounts/read',
      name : 'AccountRead',
      component : AccountRead
    },
    {
      path : '/goods/add',
      name : 'GoodAdd',
      component : GoodAdd
    },
    {
      path : '/goods/read',
      name : 'GoodRead',
      component : GoodRead
    }
  ]
});
