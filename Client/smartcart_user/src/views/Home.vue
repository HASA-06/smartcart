<template>
  <div id="home">
    <div id="home-container">
      <p id="home-container-title">무인카트 결제서비스에 오신것을 환영합니다 소중한 고객님 :)</p>
      <p class="home-container-contents">결제를 진행하고 싶으신가요?</p>
      <div class="home-container-button" v-on:click="signInButton">
        <p class="home-container-button-text">로그인하기</p>
      </div>
      <p class="home-container-contents">아직 회원이 아니신가요?</p>
      <div class="home-container-button" v-on:click="signUpButton">
        <p class="home-container-button-text">회원가입하기</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods : {
    signInButton : function () {
      this.$router.push({
        name : 'SignIn'
      })
    },
    signUpButton : function () {
      this.$router.push({
        name : 'SignUp'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#home-container {
  float : left;
  width : 90vw;
  height : 110vw;
  margin : 5vw;
}

#home-container-title {
  float : left;
  width : 85vw;
  text-align : center;
  margin : 10vw 2.5vw 10vw 2.5vw;
  padding : 0;
  color : #3C0269;
  font-size : 4.5vw;
}

.home-container-contents {
  float : left;
  width : 90vw;
  height : auto;
  text-align : center;
  font-size : 3vw;
  color : #585858;
}

.home-container-button {
  width : 70vw;
  height : 10vw;
  background-color : #3C0269;
  float : left;
  border-radius : 1vw;
  color : #ffffff;
  margin : 0 10vw 10vw 10vw;
  font-size : 5vw;
  font-weight : 900;
}

.home-container-button:hover {
  cursor : pointer;
  background-color : #2D024F;
}

.home-container-button:active {
  cursor : pointer;
  background-color : #2D024F;
}

.home-container-button-text {
  width : 70vw;
  text-align : center;
  margin : 1vw 0 0 0;
  float : left;
  padding : 0;
}
@media ( min-width : 768px ) {

}

@media ( min-width : 1024px ) {

}
</style>
