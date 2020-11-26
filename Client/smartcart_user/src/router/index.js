import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import SignIn from '../views/SignIn.vue';
import SignUp from '../views/SignUp.vue';
import ShoppingList from '../views/ShoppingList.vue'
import store from '../store';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path : '/sign-in',
    name : 'SignIn',
    component : SignIn
  },
  {
    path : '/sign-up',
    name : 'SignUp',
    component : SignUp
  },
  {
    path : '/shopping-list',
    name : 'ShoppingList',
    component : ShoppingList
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
