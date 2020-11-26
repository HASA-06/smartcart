import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    host : 'localhost:3000',
    urls : {
      adminsAccountsSignin : '/admins/accounts/sign-in',
      adminsAccountsSignOut : '/admins/accounts/sign-out',
      adminsAccountsRegist : '/admins/accounts/regist',
      adminsAccountsRead : '/admins/accounts/read',
      adminsAccountsDelete : '/admins/accounts/delete',
      adminsTokensCheck : '/admins/tokens/check',
      adminsTokensReissue : '/admins/tokens/reissue',
      adminsGoodsCheck : '/admins/goods/check',
      adminsGoodsCreate : '/admins/goods/create',
      adminsGoodsRead : '/admins/goods/read',
      adminsGoodsUpdate : '/admins/goods/update',
      adminsGoodsDelete : '/admins/goods/delete'
    },
    adminEmail : '',
    adminToken : '',
    adminName : '',
    masterAdminEmail : 'one_of_us@email.com'
  },
  getters : {
    getUserInfo : state => {
      return {
        'adminToken' : state.adminToken,
        'adminEmail' : state.adminEmail,
        'adminName' : state.adminName,
        'masterAdminEmail' : state.masterAdminEmail
      }
    }
  },
  mutations: {
    setToken : function(state, payload) {
      state.adminToken = payload.adminToken;
      state.adminEmail = payload.adminEmail;
      state.adminName = payload.adminName;
    },
    signOut : function(state) {
      state.adminEmail = '';
      state.adminToken = '';
      state.adminName = '';
    }
  },
  actions: {

  }
})
