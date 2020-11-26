import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    host : 'http://localhost:3000',
    urls : {
      usersAccountsSignIn : '/users/accounts/sign-in',
      usersAccountsSignUp : '/users/accounts/sign-up',
      usersAccountsSignOut : '/users/accounts/sign-out',
      usersGoodsAdd : '/users/goods/add',
      usersGoodsRead : '/users/goods/read',
      usersGoodsDelete : '/users/goods/delete',
      usersTokensCheck : '/users/tokens/check',
      usersTokensReissue : '/users/tokens/reissue',
      usersPaymentsDo : '/users/payments/do',
      usersPaymentsApply : '/users/payments/apply',
    },
    user : {
      email : '',
      name : '',
      token : '',
      id : ''
    }
  },
  getters : {
    getUser : function(state) {
      return {
        'userEmail' : state.user.email,
        'userName' : state.user.name,
        'userToken' : state.user.token,
        'userId' : state.user.id
      }
    }
  },
  mutations: {
    setUser : function(state, payload) {
      state.user.email = payload.userEmail;
      state.user.name = payload.userName;
      state.user.token = payload.userToken;
      state.user.id = payload.userId
    },
    deleteUser : function(state) {
      state.user.email = '';
      state.user.name = '';
      state.user.token = '';
      state.user.id = '';
    },
  },
  actions: {
  },
  modules: {
  }
})
