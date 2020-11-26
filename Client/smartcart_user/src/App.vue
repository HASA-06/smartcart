<template>
  <div id="app">
    <div id="app-container">
      <ClientHeaderComponent></ClientHeaderComponent>
      <router-view :userName="userName" :userId="userId"/>
      <ClientFooterComponent></ClientFooterComponent>
    </div>
  </div>
</template>

<script>
import ClientHeaderComponent from './components/ClientHeader';
import ClientFooterComponent from './components/ClientFooter';

export default {
  name : 'App',
  components : {
    ClientHeaderComponent,
    ClientFooterComponent,
  },
  data : function() {
    return {
      userEmail : '',
      userName : '',
      userToken : '',
      userId : ''
    }
  },
  created () {
    this.userCheck();
  },
  methods : {
    tokenAPI : function(header) {
      this.$axios.post(this.$store.state.host + this.$store.state.urls.usersTokensCheck, null, header)
      .then(res => {
        var sessionStorage = window.sessionStorage;

        this.$store.commit('setUser', {userEmail : sessionStorage.getItem('userEmail'), userName : sessionStorage.getItem('userName'), userToken : sessionStorage.getItem('userToken'), userId : sessionStorage.getItem('userId')});
        if(this.$route.name != 'ShoppingList') {
          this.$router.push({
            name : 'ShoppingList'
          });
        }
      })
      .catch(error => {
        if(error.response.status == 400 && error.response.data.title == 'Check token fail') {
          this.$axios.post(this.$store.state.host + this.$store.state.urls.usersTokensReissue, null, header)
          .then(res => {
            if(res.status == 201) {
              sessionStorage.setItem('userToken', res.data.data);
              this.$store.commit('setUser', {userEmail : sessionStorage.getItem('userEmail'), userName : sessionStorage.getItem('userName'), userToken : sessionStorage.getItem('userToken'), userId : sessionStorage.getItem('userId')});

              if(this.$route.name != 'ShoppingList') {
                this.$router.push({
                  name : 'ShoppingList'
                });
              } else {
                alert('토큰이 만료되었습니다. 다시 시도해보세요 :)');
              }
            }
          })
          .catch(error => {

          });
        } else if(error.response.status == 400 && error.response.data.title == 'No user with this token') {
          alert('시간이 초과되어 종료되어 강제 로그아웃 되었습니다. 다시 로그인해주세요');

          if(this.$route.name != 'Home') {
            this.$router.push({
              name : 'Home'
            });
          }
        } else {
          console.log('Server error, please ask to developer');
          alert('Server error, please ask to developer');
        }
      });
    },
    userCheck : function() {
      var sessionStorage = window.sessionStorage;

      if(sessionStorage.getItem('userToken')) {
        var userTokenConfig = {
          headers : {
            token : sessionStorage.getItem('userToken')
          }
        };

        this.tokenAPI(userTokenConfig);
      } else {
        if(this.$route.name != 'Home') {
          this.$router.push({
            name : 'Home'
          });
        }
      }
    }
  },
  computed : {
    getUserData : function() {
      return this.$store.getters.getUser;
    }
  },
  watch : {
    getUserData : function(currentValue, pastValue) {
      if(currentValue.userToken == '') {
        var sessionStorage = window.sessionStorage;

        this.$store.commit('setUser', {userEmail : sessionStorage.getItem('userEmail'), userName : sessionStorage.getItem('userName'), userToken : sessionStorage.getItem('userToken'), userId : sessionStorage.getItem('userId')});
      }

      this.userEmail = this.$store.state.user.email;
      this.userName = this.$store.state.user.name;
      this.userToken = this.$store.state.user.token;
      this.userId = this.$store.state.user.id;
    }
  }
}
</script>

<style lang="scss">
#app {
  width : 100vw;
  height : auto;
  font-family : 'Noto Sans KR', sans-serif;
  color : #000000;
}

#app-container {
  width : 100vw;
  height : auto;
  margin : 0 auto 0 auto;
}

@media ( min-width : 768px ) {

}

@media ( min-width : 1024px ) {

}
</style>
