<template>
    <div id="sign-in">
        <div id="sign-in-container">
            <p id="sign-in-container-title">로그인</p>
            <custom-input class="user-email-input" @createWait="getUserEmailInput" :inputLabel="userEmailInput.inputLabel" :inputType="userEmailInput.inputType" :explainText="userEmailInput.explainText" :errorText="userEmailInput.errorText" :isError="userEmailInput.isError"></custom-input>
            <custom-input class="user-password-input" @createWait="getUserPasswordInput" :inputLabel="userPasswordInput.inputLabel" :inputType="userPasswordInput.inputType" :explainText="userPasswordInput.explainText" :errorText="userPasswordInput.errorText" :isError="userPasswordInput.isError"></custom-input>
            <custom-button class="back-button" @click.native="backButton" :buttonText="buttonText.back"></custom-button>
            <custom-button class="sign-in-button" @click.native="signInButton" :buttonText="buttonText.signIn"></custom-button>
        </div>
    </div>
</template>

<script>
export default {
    name : 'SignIn',
    data : function() {
        return {
            userEmailInput : {
                inputLabel : '이메일',
                inputType : 'text',
                explainText : '이메일을 입력해 주세요',
                errorText : '유효하지 않은 이메일입니다',
                isError : false,
                value : ''
            },
            userPasswordInput : {
                inputLabel : '비밀번호',
                inputType : 'password',
                explainText : '비밀번호를 입력해주세요',
                errorText : '유효하지 않은 비밀번호입니다',
                isError : false,
                value : ''
            },
            buttonText : {
                signIn : '로그인',
                back : '뒤로가기'
            }
        }
    },
    methods : {
        getUserEmailInput : function(inputValue) {
            this.userEmailInput.value = inputValue;
        },
        getUserPasswordInput : function(inputValue) {
            this.userPasswordInput.value = inputValue;
        },
        backButton : function() {
            if(this.$route.name != 'Home') {
                this.$router.push({
                    name : 'Home'
                });
            }
        },
        initializeError : function() {
            this.userEmailInput.isError = false;
            this.userEmailInput.errorText = '유효하지 않은 이메일입니다';
            this.userPasswordInput.isError = false;
            this.userPasswordInput.errorText = '유효하지 않은 비밀번호입니다'
        },
        checkDefaultValidity : function(data) {
            if(data == '' || data == null || data == 'null' || data === undefined) return false;
            return true;
        },
        checkInputValidity : function() {
            this.initializeError();

            var email = this.userEmailInput.value;
            var password = this.userPasswordInput.value;

            var emailRegExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
            var passwordRegExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{6,18}$/;

            if(!this.checkDefaultValidity(email) || !emailRegExp.test(email)) {
                this.userEmailInput.isError = true;

                return false;
            } else if(!this.checkDefaultValidity(password) || !passwordRegExp.test(password)) {
                this.userPasswordInput.isError = true;

                return false;
            } else {
                return true;
            }
        },
        signInButton : function() {
            if(this.checkInputValidity()) {
                var usersAccountsSignInParams = {
                    userEmail : this.userEmailInput.value,
                    userPassword : this.userPasswordInput.value
                };

                this.$axios.post(this.$store.state.host + this.$store.state.urls.usersAccountsSignIn, usersAccountsSignInParams)
                .then(res => {
                    if(res.status == 201) {
                        this.$store.commit('setUser', {userEmail : this.userEmailInput.value, userName : res.data.userName, userToken : res.data.data, userId : res.data.userId});

                        var sessionStorage = window.sessionStorage;
                        sessionStorage.setItem('userEmail', this.userEmailInput.value);
                        sessionStorage.setItem('userName', res.data.userName);
                        sessionStorage.setItem('userToken', res.data.data);
                        sessionStorage.setItem('userId', res.data.userId);

                        this.$router.push({
                            name : 'ShoppingList'
                        });
                    }
                })
                .catch(error => {
                    if(error.response.status == 400 && error.response.data.title == 'No user') {
                        this.userEmailInput.errorText = '유저정보가 옳지 않습니다'
                        this.userPasswordInput.errorText = '유저정보가 옳지 않습니다'
                        this.userEmailInput.isError = true;
                        this.userPasswordInput.isError = true;
                    } else {
                        console.log('Server error, please ask to developer');
                        alert('Server error, please ask to developer');
                    }
                });
            }
        }
    }
}
</script>

<style lang="scss" scoped>
#sign-in-container {
    float : left;
    width : 100vw;
    height : 110vw;
    margin : 5vw 0 5vw 0;
}

#sign-in-container-title {
    float : left;
    font-size : 6vw;
    font-weight : 900;
    width : 100vw;
    text-align : center;
    margin : 7.5vw 0 0 0;
    padding : 0;
    color : #3C0269;
}

.user-password-input {
    float : left;
    margin-bottom : 10vw;
}

.back-button {
    float : left;
    margin : 0 2.5vw 0 14vw;
}

@media ( min-width : 768px ) {

}

@media ( min-width : 1024px ) {

}
</style>