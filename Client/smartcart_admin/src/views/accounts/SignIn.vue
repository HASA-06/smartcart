<template>
    <div id="sign-in">
        <div id="sign-in-container">
            <div id="sign-in-box">
                <div id="sign-in-dummy-box"></div>
                <div id="sign-in-title-box">
                    <img id="key-logo" src="../../assets/images/one_of_us_companys/key_icon.png"/> 
                    <p id="sign-in-title">Admin Access</p>
                </div>
                <input type="text" class="sign-in-input" id="email-input-box" v-model.lazy="email"/>
                <p class="validity-error-box" id="email-validity-error-box">{{ emailErrorText }}</p>
                <input type="password" class="sign-in-input" id="password-input-box" v-model.lazy="password"/>
                <p class="validity-error-box" id="password-validity-error-box">{{ passwordErrorText }}</p>
                <div id="checkbox-container" v-on:click="onClickCheckbox">
                    <div id="checkbox-box">
                        <img class="checkbox-img" id="checkbox-img-off" src="../../assets/images/one_of_us_companys/checkbox_off_icon.png">
                        <img class="checkbox-img" id="checkbox-img-on" src="../../assets/images/one_of_us_companys/checkbox_on_icon.png">
                        <p id="checkbox-text">로그인 상태 유지하기</p>
                    </div>
                </div>
                <div id="sign-in-button" v-on:click="onClickSignInButton">
                    <p id="sign-in-button-text">로그인</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name : 'SignIn',
    data () {
        return {
            email : '',
            password : '',
            signInMaintenance : false,
            emailErrorText : '이메일 형식을 맞춰주세요',
            passwordErrorText : '비밀번호는 6자리 이상입니다'
        }
    },
    methods : {
        onClickCheckbox : function () {
            if(this.signInMaintenance) {
                this.signInMaintenance = false;
                document.getElementById('checkbox-img-on').style.display = 'none';
                document.getElementById('checkbox-img-off').style.display = 'block';
            } else {
                this.signInMaintenance = true;
                document.getElementById('checkbox-img-on').style.display = 'block';
                document.getElementById('checkbox-img-off').style.display = 'none';
            }
        },
        onClickSignInButton : function() {
            if(this.checkInputValidity()) {
                var signInParams = {
                    adminEmail : this.email,
                    adminPassword : this.password
                };

                this.$axios.post(this.$store.state.host + this.$store.state.urls.adminsAccountsSignin, signInParams)
                .then(res => {
                    if(res.status == 201) {
                        this.$store.commit('setToken', {adminToken : res.data.data, adminEmail : this.email, adminName : res.data.adminName});
                        var adminEmail = this.email;
                    
                        if(this.signInMaintenance) {
                            var localStorage = window.localStorage;
                            localStorage.setItem('adminToken', res.data.data);
                            localStorage.setItem('adminEmail', this.email);
                            localStorage.setItem('adminName', res.data.adminName);
                            
                            this.$cookie.set('signInMaintenance', 'Y', {expires: '24h'});
                            this.$router.push({
                                name : 'GoodAdd'
                            });
                        } else {
                            var sessionStorage = window.sessionStorage;
                            sessionStorage.setItem('adminToken', res.data.data);
                            sessionStorage.setItem('adminEmail', this.email);
                            sessionStorage.setItem('adminName', res.data.adminName);

                            this.$cookie.set('signInMaintenance', 'N');
                            this.$router.push({
                                name : 'GoodAdd'
                            });
                        }
                    } else {
                        console.log('Server error, please ask to developer');
                        alert('Server error, please ask to developer');
                    }
                })
                .catch(error => {
                    if(error) {
                        if(error.response.status == 400) {
                            if(error.response.data.title == 'No admin') {
                                this.emailErrorText = '이메일을 확인해주세요';
                                this.passwordErrorText = '비밀번호를 확인해주세요'
                                this.isValidityError('email-input-box', 'email-validity-error-box');
                                this.isValidityError('password-input-box', 'password-validity-error-box');
                            } else if(error.response.data.title == 'Sign in check fail') {
                                this.emailErrorText = '입력값이 부족합니다'
                                this.passwordErrorText = '입력값이 부족합니다'
                                this.isValidityError('email-input-box', 'email-validity-error-box');
                                this.isValidityError('password-input-box', 'password-validity-error-box');
                            }
                        } else if(error.response.status == 500) {
                            console.log('Server error, please ask to developer');
                            alert('Server error, please ask to developer');
                        }
                    }
                });
            }
        },
        checkInputValidity : function() {
            var email = this.email;
            var password = this.password;
            var validityErrorBoxs = document.getElementsByClassName('validity-error-box');
            var signInInputBoxs = document.getElementsByClassName('sign-in-input');

            for(var indexOfBox = 0; indexOfBox < 2; indexOfBox++) {
                validityErrorBoxs[indexOfBox].style.opacity = '0';
                signInInputBoxs[indexOfBox].style.border = '2px solid #3C0269';
                signInInputBoxs[indexOfBox].style.color = '#3C0269';
            }

            if(email == '' || email == null || email.indexOf('@') == -1 || email.indexOf('.') == -1 || email.indexOf('@') >= email.indexOf('.')) {
                this.emailErrorText = '이메일 형식을 맞춰주세요';
                this.isValidityError('email-input-box', 'email-validity-error-box');

                return false;
            } else if(password == '' || password.length < 6) {
                this.passwordErrorText = '비밀번호는 6자리 이상입니다';
                this.isValidityError('password-input-box', 'password-validity-error-box');

                return false;
            } else {
                return true;
            }
            
        },
        isValidityError : function(inputBoxId, errorBoxId) {
            document.getElementById(inputBoxId).style.border = '2px solid #FF0000';
            document.getElementById(inputBoxId).style.color = '#FF0000';
            document.getElementById(errorBoxId).style.opacity = '1';
        }
    }
}
</script>

<style lang="scss" scoped>
#sign-in-container {
    float : left;
    width : 1280px;
    height : 800px;
}

#sign-in-box {
    float : left;
    width : 1000px;
    height : 600px;
    margin : 100px 139px 0 139px;
    border : 4px solid #3C0269;
    border-radius : 50px;
}

#sign-in-dummy-box {
    float : left;
    width : 100px;
    height : 600px;
    margin : 0;
    background-color : #3C0269;
    border-radius : 40px;
}

#sign-in-title-box {
    float : left;
    width : 890px;
    height : 60px;
    margin : 64px 0 40px 0;
}

#key-logo {
    float : left;
    width: 60px;
    height : 50px;
    max-width : 60px;
    margin : 8px 0 0 40px;
}

#sign-in-title {
    float : left;
    display : block;
    width : auto;
    height : auto;
    margin : 0 auto 0 10px;
    font-size : 44px;
    font-weight : 800;
    color : #3C0269;
}

.sign-in-input {
    float : left;
    width : 800px;
    height : 60px;
    margin : 10px auto 0 40px;
    padding-left : 20px;
    border : 2px solid #3C0269;
    border-radius : 8px;
    font-size : 28px;
    color : #3C0269;
    font-family : 'Noto Sans KR', sans-serif;
}

.validity-error-box {
    float : left;
    display : block;
    margin : 10px 0 0 44px;
    padding : 0;
    color : #FF0000;
    font-size : 16px;
    opacity : 0;
}

.sign-in-input:hover {
    border : 3px solid #6103A8;
    font-size : 30px;
    color : #6103A8;
    cursor : pointer;
    font-family : 'Noto Sans KR', sans-serif;
}

.sign-in-input:active {
    border : 3px solid #6103A8;
    font-size : 30px;
    color : #6103A8;
    cursor : pointer;
    font-family : 'Noto Sans KR', sans-serif;
}

.sign-in-input:focus {
    outline : none;
    border : 3px solid #6103A8;
    font-size : 30px;
    color : #6103A8;
    cursor : pointer;
    font-family : 'Noto Sans KR', sans-serif;
}

#checkbox-container {
    float : left;
    width : 820px;
    margin : 10px auto 0 40px;
}

#checkbox-container:hover {
    cursor : pointer;
}

#checkbox-container:active {
    cursor : pointer;
}

#checkbox-box {
    float : left;
}

.checkbox-img {
    float : left;
    width : 34px;
    height : 34px;
    max-width : 34px;
}

#checkbox-img-off {
    display : block;
}

#checkbox-img-on {
    display : none;
}

#checkbox-text {
    float : left;
    margin : 2px 0 0 10px;
    padding : 0;
    font-size : 18px;
    font-weight : 600;
    color : #3C0269;
}

#sign-in-button {
    float : left;
    width : 820px;
    height : 68px;
    margin : 20px auto 20px 40px;
    background-color : #3C0269;
    border-radius : 8px;
}

#sign-in-button-text {
    float : left;
    display : block;
    width : 90px;
    margin : 10px 365px 0 365px;
    padding : 0;
    font-size : 32px;
    color : #FFFFFF;
}

#sign-in-button:hover {
    background-color : #6103A8;
    cursor : pointer;
}

#sign-in-button:active {
    background-color : #6103A8;
    cursor : pointer;
}
</style>