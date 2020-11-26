<template>
  <div id="home">
    <div id="home-container">
      <img id="oneofus-company-logo" src="../assets/images/one_of_us_companys/logo.jpg"/>
      <p id="home-container-text">관리자 계정으로 로그인 시, 해당 창이 활성화 됩니다 :)</p>
      <a href="javascript:;" v-on:click="routeSignInButton"><p id="home-container-sign-in-text">관리자 로그인</p></a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods : {
    routeSignInButton : function() {
      this.$router.push({
        name : 'SignIn'
      });
    }
  }
}
</script>

<style lang="scss" scoped>
#home-container {
  float : left;
  width : 1280px;
  height : 800px;
}

#oneofus-company-logo {
  float : left;
  width : 800px;
  height : 200px;
  max-width : 1280px;
  margin : 240px 240px auto 240px;
}

#home-container-text {
  float : left;
  display : block;
  width : 1280px;
  height : auto; 
  margin : 20px 0 0 0;
  padding : 0;
  text-align : center;
  font-size : 20px;
  font-weight : 700;
}

#home-container-sign-in-text {
  float : left;
  display : block;
  margin : 20px 420px auto 420px;
  padding : 0;
  width : 440px;
  padding-top : 6px;
  height : 50px;
  font-size : 28px;
  font-weight : 900;
  text-align : center;
  background-color : #3C0269;
  color : #FFFFFF;
  border-radius : 8px;
  box-shadow : 1px 1px #6103A8;
}

#home-container-sign-in-text:hover {
  cursor : pointer;
  font-weight : 900;
  background-color : #6103A8;
}

#home-container-sign-in-text:active {
  cursor : pointer;
  font-weight : 900;
  background-color : #6103A8;
}
</style>
