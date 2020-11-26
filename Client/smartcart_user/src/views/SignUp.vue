<template>
    <div id="sign-up">
        <div id="sign-up-container">
            <p id="sign-up-container-title">회원가입</p>
            <custom-input @createWait="getUserEmailInput" :inputLabel="userEmailInput.inputLabel" :inputType="userEmailInput.inputType" :explainText="userEmailInput.explainText" :errorText="userEmailInput.errorText" :isError="userEmailInput.isError"></custom-input>
            <custom-input @createWait="getUserPasswordInput" :inputLabel="userPasswordInput.inputLabel" :inputType="userPasswordInput.inputType" :explainText="userPasswordInput.explainText" :errorText="userPasswordInput.errorText" :isError="userPasswordInput.isError"></custom-input>
            <custom-input @createWait="getUserPasswordAcceptInput" :inputLabel="userPasswordAcceptInput.inputLabel" :inputType="userPasswordAcceptInput.inputType" :explainText="userPasswordAcceptInput.explainText" :errorText="userPasswordAcceptInput.errorText" :isError="userPasswordAcceptInput.isError"></custom-input>
            <custom-input @createWait="getUserNameInput" :inputLabel="userNameInput.inputLabel" :inputType="userNameInput.inputType" :explainText="userNameInput.explainText" :errorText="userNameInput.errorText" :isError="userNameInput.isError"></custom-input>
            <custom-input class="user-phone-number-input" @createWait="getUserPhoneNumberInput" :inputLabel="userPhoneNumberInput.inputLabel" :inputType="userPhoneNumberInput.inputType" :explainText="userPhoneNumberInput.explainText" :errorText="userPhoneNumberInput.errorText" :isError="userPhoneNumberInput.isError"></custom-input>
            <custom-button class="back-button" @click.native="backButton" :buttonText="buttonText.back"></custom-button>
            <custom-button class="sign-up-button" @click.native="signUpButton" :buttonText="buttonText.signUp"></custom-button>
        </div>
    </div>
</template>

<script>
export default {
    name : 'SignUp',
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
                errorText : '비밀번호는 6자리 이상 18자리 이하의 영소문자, 숫자의 조합입니다',
                isError : false,
                value : ''
            },
            userPasswordAcceptInput : {
                inputLabel : '비밀번호 확인',
                inputType : 'password',
                explainText : '다시한번 비밀번호를 입력해주세요',
                errorText : '비밀번호와 같아야합니다',
                isError : false,
                value : ''
            },
            userNameInput : {
                inputLabel : '닉네임',
                inputType : 'text',
                explainText : '닉네임은 4자리이상의 문자입니다',
                errorText : '닉네임을 확인해주세요',
                isError : false,
                value : ''
            },
            userPhoneNumberInput : {
                inputLabel : '핸드폰번호',
                inputType : 'text',
                explainText : '\'-\'를 제외하고 핸드폰번호를 입력해 주세요',
                errorText : '핸드폰번호를 확인해주세요',
                isError : false,
                value : ''
            },
            buttonText : {
                signUp : '회원가입',
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
        getUserPasswordAcceptInput : function(inputValue) {
            this.userPasswordAcceptInput.value = inputValue;
        },
        getUserNameInput : function(inputValue) {
            this.userNameInput.value = inputValue;
        },
        getUserPhoneNumberInput : function(inputValue) {
            this.userPhoneNumberInput.value = inputValue;
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
            this.userPasswordInput.isError = false;
            this.userPasswordAcceptInput.isError = false;
            this.userNameInput.isError = false;
            this.userPhoneNumberInput.isError = false;
        },
        checkDefaultValidity : function(data) {
            if(data == '' || data == null || data == 'null' || data === undefined) return false;
            return true;
        },
        checkInputValidity : function() {
            this.initializeError();

            var email = this.userEmailInput.value;
            var password = this.userPasswordInput.value;
            var passwordAccept = this.userPasswordAcceptInput.value;
            var name = this.userNameInput.value;
            var phoneNumber = this.userPhoneNumberInput.value;

            var emailRegExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
            var passwordRegExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{6,18}$/;
            var nameRegExp = /^[a-zA-Z0-9]{4,10}/;
            var phoneNumberRegExp = /^\d{10,11}/;
           
            if(!this.checkDefaultValidity(email) || !emailRegExp.test(email)) {
                this.userEmailInput.isError = true;

                return false;
            } else if(!this.checkDefaultValidity(password) || !passwordRegExp.test(password)) {
                this.userPasswordInput.isError = true;

                return false;
            } else if(password != passwordAccept) {
                this.userPasswordAcceptInput.isError = true;

                return false;
            } else if(!this.checkDefaultValidity(name) || !nameRegExp.test(name)) {
                this.userNameInput.isError = true;
                
                return false;
            } else if(!this.checkDefaultValidity(phoneNumber) || !phoneNumberRegExp.test(phoneNumber)) {
                this.userPhoneNumberInput.isError = true;

                return false;
            } else {
                return true;
            }
        },
        signUpButton : function() {
            if(this.checkInputValidity()) {
                var usersAccountsSignUpParams = {
                    userEmail : this.userEmailInput.value,
                    userPassword : this.userPasswordInput.value,
                    userPasswordAccept : this.userPasswordAcceptInput.value,
                    userName : this.userNameInput.value,
                    userPhoneNumber : this.userPhoneNumberInput.value
                };

                this.$axios.post(this.$store.state.host +this.$store.state.urls.usersAccountsSignUp, usersAccountsSignUpParams)
                .then(res => {
                    if(res.status == 201) {
                        alert('회원가입이 완료되었습니다 :)');
                        
                        this.$router.push({
                            name : 'Home'
                        });
                    }
                })
                .catch(error => {
                    if(error.response.status == 400 && error.response.data.title == 'Email is duplicated') {
                        this.userEmailInput.errorText = '이미 가입된 이메일주소입니다'
                        this.userEmailInput.isError = true;
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
#sign-up-container {
    float : left;
    width : 100vw;
    height : auto;
    margin : 5vw 0 5vw 0;
}

#sign-up-container-title {
    float : left;
    font-size : 6vw;
    font-weight : 900;
    width : 100vw;
    text-align : center;
    margin : 7.5vw 0 0 0;
    padding : 0;
    color : #3C0269;
}

.user-phone-number-input {
    float : left;
    margin-bottom : 10vw;
}

.back-button {
    float : left;
    margin : 0 2.5vw 12.5vw 14vw;
}
</style>