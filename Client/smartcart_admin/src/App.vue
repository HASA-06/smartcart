<template>
  <div id="app">
    <div id="app-container">
      <ClientHeaderComponent class="client-header"></ClientHeaderComponent>
      <AdminStatusComponent class="admin-status-component" v-if="adminStatus" :adminName="adminName"></AdminStatusComponent>
      <router-view class="router-view"/>
      <NavigatorComponent class="navigator-component" v-if="adminStatus" :isMasterAdmin="isMasterAdmin"></NavigatorComponent>
      <ClientFooterComponent class="client-footer"></ClientFooterComponent>
    </div>
  </div>
</template>

<script>
import ClientHeaderComponent from './components/ClientHeader';
import ClientFooterComponent from './components/ClientFooter';
import NavigatorComponent from './components/Navigator';
import AdminStatusComponent from './components/AdminStatus';

export default {
  name : 'App',
  components : {
    ClientHeaderComponent,
    ClientFooterComponent,
    NavigatorComponent,
    AdminStatusComponent
  },
  data : function () {
    return {
      adminName : '',
      adminStatus : false,
      isMasterAdmin : false
    }
  },
  methods : {
    reloadTask : function () {
      var localStorage = window.localStorage;
      var sessionStorage = window.sessionStorage;
      var reloadTaskConfig = {
        headers : {
          token : ''
        }
      };

      if(this.$cookie.get('signInMaintenance') == 'Y') {
        reloadTaskConfig.headers.token = localStorage.adminToken;
        this.tokenCheck(localStorage, reloadTaskConfig);
      } else if(this.$cookie.get('signInMaintenance') == 'N') {
        reloadTaskConfig.headers.token = sessionStorage.adminToken;
        this.tokenCheck(sessionStorage, reloadTaskConfig);
      } else {
        sessionStorage.removeItem('adminToken');
        sessionStorage. removeItem('adminEmail');
        sessionStorage.removeItem('adminName');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminName');

        return;
      }
    },
    tokenCheck : function(signInStoreTypeObject, headerConfig) {
      this.$axios.post(this.$store.state.host + this.$store.state.urls.adminsTokensCheck, null, headerConfig)
      .then(res => {
        if(res.status == 201) {
          this.$store.commit('setToken', {adminToken : signInStoreTypeObject.getItem('adminToken'), adminEmail : signInStoreTypeObject.getItem('adminEmail'), adminName : signInStoreTypeObject.getItem('adminName')});
          if(this.$route.name != 'GoodAdd') {
            this.$router.push({
              name : 'GoodAdd'
            });
          }
        }
      })
      .catch(error => {
        if(error) {
          if(error.response.status == 400) {
            if(error.response.data.title = 'Check token fail') {
              this.$axios.post(this.$store.state.host + this.$store.state.urls.adminsTokensReissue, null, headerConfig)
              .then(res => {
                if(res.status == 201) {
                  signInStoreTypeObject.setItem('adminToken', res.data.data);
                  this.$store.commit('setToken', {adminToken : res.data.data, adminEmail : signInStoreTypeObject.getItem('adminEmail'), adminName : signInStoreTypeObject.getItem('adminName')});
                  if(this.$route.name != 'GoodAdd') {
                      this.$router.push({
                      name : 'GoodAdd'
                    });
                  } else {
                    alert('토큰이 만료되었습니다. 다시 시도해보세요.');
                  }
                }
              })
              .catch(err => {
                if(err) {
                  this.$cookie.set('signInMaintenance', '');
                  console.log('Server error, please ask to developer');
                  alert('Server error, please ask to developer');
                }
              })
            } else if(error.response.data.title = 'No admin with this token') {
              this.$cookie.set('signInMaintenance', '');
              console.log('Server error, please ask to developer');
              alert('Server error, please ask to developer');
            }
          } else if(error.response.status == 500) {
            this.$cookie.set('signInMaintenance', '');
            console.log('Server error, please ask to developer');
            alert('Server error, please ask to developer');
          }
        }
      });
    },
    checkValidity : function(parameter) {
      if(parameter != null && parameter !== undefined && parameter != '') return true;
      else return false;
    }
  },
  created () {
    this.reloadTask();
  },
  computed : {
    getUserInfo : function() {
      return this.$store.getters.getUserInfo;
    }
  },
  watch : {
    getUserInfo : function(currentValue, pastValue) {
      if(currentValue.adminToken != '') {
        this.adminName = currentValue.adminName;
        this.adminStatus = true;
        if(currentValue.masterAdminEmail == currentValue.adminEmail) {
          this.isMasterAdmin = true;
        } else {
          this.isMasterAdmin = false;
        }
      } else {
        this.adminName = currentValue.adminName;
        this.adminStatus = false;
      }
    }
  }
}
</script>

<style lang="scss">
#app {
  width: 1280px;
  height: auto;
  margin: 50px auto 0 auto;
  font-family : 'Noto Sans KR', sans-serif;
  color : #000000;
}

#app-container {
  float : left;
  background-color : #FFFFFF;
}

.client-header {
  float : left;
}

.router-view {
  float : right;
  margin: 40px 0 0 0;
}

.admin-status-component {
  float : left;
  margin : 40px 0 0 0;
}

.navigator-component {
  float : left;
  margin: 40px 0 40px 0;
}

.client-footer {
  float : left;
}
</style>
