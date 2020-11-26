<template>
    <div id="account-regist">
        <div id="account-regist-container">
            <p id="account-regist-container-title">관리자 등록</p>
            <div class="horizontal-line"></div>
            <div class="input-box-container">
                <p class="input-box-label">아이디</p>
                <input type="text" class="good-add-input-box" v-model.lazy="adminEmail"/>
                <p class="input-box-explanation" v-show="!isAdminEmailError">{{ adminEmailExplainText }}</p>
                <p class="input-box-error" v-show="isAdminEmailError"> {{ adminEmailErrorText }} </p>
            </div>
            <div class="input-box-container">
                <p class="input-box-label">관리자명</p>
                <input type="text" class="good-add-input-box" v-model.lazy="adminName"/>
                <p class="input-box-explanation" v-show="!isAdminNameError">{{ adminNameExplainText }}</p>
                <p class="input-box-error" v-show="isAdminNameError"> {{ adminNameErrorText }} </p>
            </div>
            <div class="input-box-container">
                <p class="input-box-label">비밀번호</p>
                <input type="password" class="good-add-input-box" v-model.lazy="adminPassword"/>
                <p class="input-box-explanation" v-show="!isAdminPasswordError">{{ adminPasswordExplainText }}</p>
                <p class="input-box-error" v-show="isAdminPasswordError"> {{ adminPasswordErrorText }} </p>
            </div>
            <div class="input-box-container">
                <p class="input-box-label">비밀번호 확인</p>
                <input type="password" class="good-add-input-box" v-model.lazy="adminPasswordAccept"/>
                <p class="input-box-explanation" v-show="!isAdminPasswordAcceptError">{{ adminPasswordAcceptExplainText }}</p>
                <p class="input-box-error" v-show="isAdminPasswordAcceptError"> {{ adminPasswordAcceptErrorText }} </p>
            </div>
            <div id="admin-regist-button" v-on:click="adminRegistButton">
                <p id="admin-regist-button-Text">등록하기</p> 
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name : 'AccountRegist',
    data : function() {
        return {
            adminEmail : '',
            isAdminEmailError : false,
            adminEmailExplainText : '이메일 형식을 맞춰주세요',
            adminEmailErrorText : '',
            adminName : '',
            isAdminNameError : false,
            adminNameExplainText : '4자리 이상의 관리자명을 입력해 주세요',
            adminNameErrorText : '',
            adminPassword : '',
            isAdminPasswordError : false,
            adminPasswordExplainText : '비밀번호는 6자리 이상 18자리 이하의 숫자와 영소문자의 조합입니다',
            adminPasswordErrorText : '',
            adminPasswordAccept : '',
            isAdminPasswordAcceptError : false,
            adminPasswordAcceptExplainText : '비밀번호를 다시 한 번 입력해 주세요',
            adminPasswordAcceptErrorText : ''
        }
    },
    methods : {
        clearError : function () {
            this.adminEmailErrorText = '';
            this.adminNameErrorText = '';
            this.adminPasswordErrorText = '',
            this.adminPasswordAcceptErrorText ='';
            this.isAdminNameError = false;
            this.isAdminEmailError = false;
            this.isAdminPasswordError = false;
            this.isAdminPasswordAcceptError = false;
        },
        checkInputDataValidity : function () {
            this.clearError();
            var adminEmail = this.adminEmail;
            var adminPassword = this.adminPassword;
            var adminPasswordAccept = this.adminPasswordAccept;
            var adminName = this.adminName;
            var adminEmailRegExp =  /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
            var adminPasswordRegExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{6,18}$/;

            if(adminEmail == '' || adminEmail == null || adminEmail == 'null' || adminEmail === undefined || !adminEmailRegExp.test(adminEmail)) {
                this.isAdminEmailError = true;
                this.adminEmailErrorText = '이메일을 제대로 입력했는지 확인해 주세요';
                return false;
            } else if(adminName == '' || adminName == null || adminName == 'null' || adminName === undefined || adminName.length < 4) {
                this.isAdminNameError = true;
                this.adminNameErrorText = '관리자명을 확인해 주세요';
                return false;
            } else if(adminPassword == '' || adminPassword == null || adminPassword == 'null' || adminPassword === undefined || !adminPasswordRegExp.test(adminPassword)) {
                this.isAdminPasswordError = true;
                this.adminPasswordErrorText = '비밀번호는 6자리 이상 18자리 이하의 영, 소문자의 조합입니다.';
                return false;
            } else if(adminPassword != adminPasswordAccept) {
                this.isAdminPasswordAcceptError = true;
                this.adminPasswordAcceptErrorText = '비밀번호와 비밀번호 확인이 일치하지 않습니다';
                return false;
            } else {
                return true;
            }
        },
        adminRegistButton : function() {
            if(this.checkInputDataValidity()) {
                var adminRegistAPIParams = {
                    adminEmail : this.adminEmail,
                    adminName : this.adminName,
                    adminPassword : this.adminPassword,
                    adminPasswordAccept : this.adminPasswordAccept
                };
                var adminRegistAPIHeader = {
                    headers : {
                        token : this.$store.state.adminToken
                    }
                };

                this.$axios.post(this.$store.state.host + this.$store.state.urls.adminsAccountsRegist, adminRegistAPIParams, adminRegistAPIHeader)
                .then(res => {
                    if(res.status == 201) {
                        alert('새로운 관리자 등록이 완료되었습니다 :)');

                        this.$router.push({
                            name : 'AccountRead'
                        });
                    }
                })
                .catch(error => {
                    if(error) {
                        if(error.response.status == 400) {
                            if(error.response.data.title == 'Check token fail') {
                                var headerConfig = {
                                    headers : {
                                        token : this.$store.state.adminToken
                                    }
                                };

                                this.$axios.post(this.$store.state.host + this.$store.state.urls.adminsTokensReissue, null, headerConfig)
                                .then(res => {
                                    if(res.status == 201) {
                                        if(this.$cookie.get('signInMaintenance') == 'N') {
                                            var storage = window.sessionStorage;
                                            storage.setItem('adminToken', res.data.data);
                                            this.$store.commit('setToken', {adminToken : res.data.data, adminEmail : storage.getItem('adminEmail'), adminName : storage.getItem('adminName')});
                                            alert('토큰이 만료되었습니다. 다시 시도해보세요.');
                                            if(this.$route.name != 'AccountRegist') {
                                                this.$router.push({
                                                    name : 'AccountRegist'
                                                });
                                            }
                                        } else if(this.$cookie.get('signInMaintenance') == 'Y') {
                                            var storage = window.localStorage;
                                            storage.setItem('adminToken', res.data.data);
                                            this.$store.commit('setToken', {adminToken : res.data.data, adminEmail : storage.getItem('adminEmail'), adminName : storage.getItem('adminName')});
                                            alert('토큰이 만료되었습니다. 다시 시도해보세요.');
                                            if(this.$route.name != 'AccountRegist') {
                                                this.$router.push({
                                                    name : 'AccountRegist'
                                                });
                                            }
                                        }
                                    }
                                })
                                .catch(err => {
                                    if(err) {
                                        this.$cookie.set('signInMaintenance', '');
                                        console.log('Server error, please ask to developer');
                                        alert('Server error, please ask to developer');
                                    }
                                });
                            } else if(error.response.data.title == 'Regist new admin fail') {
                                alert('당신은 메인 관리자가 아닙니다');
                            } else if(error.response.data.title == 'Duplicated email') {
                                this.isAdminEmailError = true;
                                this.adminEmailErrorText = '중복된 이메일 입니다';
                            }
                        } else {
                            console.log('Server error, please ask to developer');
                            alert('Server error, please ask to developer');
                        }
                    }
                });
            }
        }
    }
}
</script>

<style lang="scss" scoped>
#account-regist-container {
    float : right;
    width : 876px;
    height : 1028px;
    border : 2px solid #3C0269;
    border-radius : 8px;
}

#account-regist-container-title {
    float : left;
    display : block;
    margin : 20px 0 0 0;
    padding : 0;
    width : 100%;
    height : auto;
    font-size : 46px;
    font-weight : 800;
    color : #3C0269;
    text-align : center;
}

.horizontal-line {
    border : 1px solid #3C0269;
    float : left;
    width : 836px;
    margin : 10px auto 20px 20px;
}

.input-box-container {
    float : left;
    width : 100%;
    height : 100px;
    margin : 20px 0 0 0;
}


.input-box-label {
    float : left;
    display : block;
    width : 220px;
    height : 40px;
    font-size : 24px;
    color : #3C0269;
    margin : 4px 0 0 0;
    padding : 0 0 0 20px;
}

.good-add-input-box {
    float : left;
    width : 590px;
    height : 40px;
    border : 2px solid #3C0269;
    border-radius : 8px;
    padding-left : 20px;
    font-family : 'Noto Sans KR', sans-serif;
    font-size : 28px;
}

.good-add-input-box:hover {
    border : 3px solid #6103A8;
    font-size : 30px;
    color : #6103A8;
    cursor : pointer;
    font-family : 'Noto Sans KR', sans-serif;
}

.good-add-input-box:active {
    border : 3px solid #6103A8;
    font-size : 30px;
    color : #6103A8;
    cursor : pointer;
    font-family : 'Noto Sans KR', sans-serif;
}

.good-add-input-box:focus {
    border : 3px solid #6103A8;
    font-size : 30px;
    color : #6103A8;
    cursor : pointer;
    font-family : 'Noto Sans KR', sans-serif;
}

.input-box-explanation {
    float : left;
    display : block;
    width : 760px;
    margin : 8px auto 0 40px;
    padding : 0;
    color : #6103A8;
}

.input-box-error {
    float : left;
    display : block;
    width : 760px;
    color : #FF0000;
    margin : 8px auto 0 40px;
}

#admin-regist-button {
    float : left;
    width : 400px;
    height : 50px;
    margin : 20px auto 0 240px;
    background-color : #3C0269;
    border-radius : 8px;
}

#admin-regist-button-Text {
    float : left;
    display : block;
    width : 400px;
    height : auto;
    font-size : 24px;
    font-weight : 700;
    text-align : center;
    color : #FFFFFF;
    margin : 4px 0 0 0;
    padding : 0;
}

#admin-regist-button:hover {
    background-color : #6103A8;
    cursor : pointer;
}

#admin-regist-button:active {
    background-color : #6103A8;
    cursor : pointer;
}
</style>