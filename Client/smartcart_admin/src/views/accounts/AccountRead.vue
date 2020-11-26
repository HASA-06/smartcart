<template>
    <div id="account-read">
        <div id="account-read-container">
            <p id="account-read-container-title">관리자 목록</p>
            <div class="horizontal-line"></div>
            <div v-if="isAllAdminData" id="admin-data-container" v-infinite-scroll="adminDataInfiniteScroll" infinite-scroll-disabled="isRealLastAdminData" infinite-scroll-distance="0" infinite-scroll-throttle-delay="1000">
                <div class="admin-data" v-for="(data) in adminDatas" :key="data.adminId">
                    <div class="admin-data-box">
                        <div class="color-box"></div>
                        <p class="impact-text">관리자 번호 ||</p>{{ data.adminId }}
                        <p class="impact-text">관리자 이메일 ||</p>{{ data.adminEmail }}
                        <p class="impact-text">관리자 이름 ||</p>{{ data.adminName }}
                        <div v-if="!isFirstAdmin(data.adminEmail)" class="admin-delete-button" v-on:click="adminDeleteButton(data.adminId)">
                            <p class="admin-delete-button-text">
                                제거
                            </p>
                        </div>
                    </div>
                </div>
                <div v-show="isLoading" class="progress-status-text">
                    Loading ......
                </div>
                <div v-show="!isLoading && !isRealLastAdminData" class="progress-status-text">
                    Please scroll down :(
                </div>
                <div v-show="!isLoading && isRealLastAdminData" class="progress-status-text">
                    It's last data :)
                </div>
                <div v-show="isNothing()" id="dummy-box"></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name : 'AccountRead',
    data : function () {
        return {
            adminDatas : [],
            isAllAdminData : true,
            isLoading : false,
            isRealLastAdminData : false
        }
    },
    created () {

    },
    methods : {
        adminDataInfiniteScroll : function () {
            if(!this.isRealLastAdminData) {
                this.isLoading = true;
                this.getMoreAdminData();
            }
        },
        getMoreAdminData : function () {
            if(this.adminDatas.length == 0) {
                var accountReadAPIParams = {
                    params : {

                    },
                    headers : {
                        token : this.$store.state.adminToken
                    }
                };

                this.$axios.get(this.$store.state.host + this.$store.state.urls.adminsAccountsRead, accountReadAPIParams)
                .then(res => {
                    if(res.status == 200) {
                        setTimeout(() => {
                            this.isLoading = false;
                            this.adminDatas = (res.data.data === undefined) ? [] : res.data.data;;
                        
                            if(this.adminDatas.length == 0) {
                                this.isRealLastAdminData = true;
                            }
                        }, 1000);
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
                                            if(this.$route.name != 'AccountRead') {
                                                this.$router.push({
                                                    name : 'AccountRead'
                                                });
                                            }
                                        } else if(this.$cookie.get('signInMaintenance') == 'Y') {
                                            var storage = window.localStorage;
                                            storage.setItem('adminToken', res.data.data);
                                            this.$store.commit('setToken', {adminToken : res.data.data, adminEmail : storage.getItem('adminEmail'), adminName : storage.getItem('adminName')});
                                            alert('토큰이 만료되었습니다. 다시 시도해보세요.');
                                            if(this.$route.name != 'AccountRead') {
                                                this.$router.push({
                                                    name : 'AccountRead'
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
                            }
                        } else {
                            console.log('Server error, please ask to developer');
                            alert('Server error, please ask to developer');
                        }
                    }
                });
            } else {
                var accountReadAPIParams = {
                    params : {
                        lastAdminId  : this.adminDatas[this.adminDatas.length - 1].adminId
                    },
                    headers : {
                        token : this.$store.state.adminToken
                    }
                };

                this.$axios.get(this.$store.state.host + this.$store.state.urls.adminsAccountsRead, accountReadAPIParams)
                .then(res => {
                    if(res.status == 200) {
                        if(res.data.data.length == 0) {
                            this.isRealLastAdminData = true;
                            this.isLoading = false;
                        } else {
                            setTimeout(() => {
                                this.isLoading = false;
                                this.adminDatas = this.adminDatas.concat(res.data.data);
                            }, 1000);
                        }
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
                                            if(this.$route.name != 'AccountRead') {
                                                this.$router.push({
                                                    name : 'AccountRead'
                                                });
                                            }
                                        } else if(this.$cookie.get('signInMaintenance') == 'Y') {
                                            var storage = window.localStorage;
                                            storage.setItem('adminToken', res.data.data);
                                            this.$store.commit('setToken', {adminToken : res.data.data, adminEmail : storage.getItem('adminEmail'), adminName : storage.getItem('adminName')});
                                            alert('토큰이 만료되었습니다. 다시 시도해보세요.');
                                            if(this.$route.name != 'AccountRead') {
                                                this.$router.push({
                                                    name : 'AccountRead'
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
                            }
                        }
                    }
                });
            }
        },
        adminDeleteButton : function (adminId) {
            let accountDeleteAPIParameter = {
                adminId : adminId
            };
            let accountDeleteAPIHeader = {
                headers : {
                    token : this.$store.state.adminToken
                }
            };

            this.$axios.post(this.$store.state.host + this.$store.state.urls.adminsAccountsDelete, accountDeleteAPIParameter, accountDeleteAPIHeader)
            .then(res => {
                if(res.status == 201) {
                    alert('관리자 계정 제거 완료했습니다');
                    this.adminDatas = [];
                    this.isRealLastAdminData = false;
                }
            })
            .catch(error => {
                if(error) {
                    if(error.response.status == 400) {
                        if(error.response.data.title == 'Not enough input') {
                            alert('해당 관리자가 이미 존재하지 않습니다');
                            this.adminDatas = [];
                            this.isRealLastAdminData = false;
                        } else if(error.response.data.title == 'Check token fail') {
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
                                        if(this.$route.name != 'AccountRead') {
                                            this.$router.push({
                                                name : 'AccountRead'
                                            });
                                        }
                                    } else if(this.$cookie.get('signInMaintenance') == 'Y') {
                                        var storage = window.localStorage;
                                        storage.setItem('adminToken', res.data.data);
                                        this.$store.commit('setToken', {adminToken : res.data.data, adminEmail : storage.getItem('adminEmail'), adminName : storage.getItem('adminName')});
                                        alert('토큰이 만료되었습니다. 다시 시도해보세요.');
                                        if(this.$route.name != 'AccountRead') {
                                            this.$router.push({
                                                name : 'AccountRead'
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
                        }
                    } else {
                        console.log('Server error, please ask to developer');
                        alert('Server error, please ask to developer');
                    }
                }
            })
        },
        isFirstAdmin : function (adminEmail) {
            if(adminEmail == this.$store.state.masterAdminEmail) return true;
            else return false;
        },
        isNothing : function () {
            if(this.adminDatas.length == 0 && !this.isRealLastAdminData) return true;
            else return false;
        }
    }
}
</script>

<style lang="scss" scoped>
#account-read-container {
    float : right;
    width : 876px;
    height : 1028px;
    border : 2px solid #3C0269;
    border-radius : 8px;
}

#account-read-container-title {
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

#admin-data-container {
    float : left;
    width : 876px;
    height : 908px;
    overflow-y : scroll;
}

.admin-data-box {
    float : left;
    width : 802px;
    height : 60px;
    margin : 0 0 10px 38px;
    border : 2px solid #3C0269;
    border-radius : 8px;
}

.color-box {
    float : left;
    width : 20px;
    height : 100%;
    background-color : #3C0269;
    border-radius : 4px 0 0 4px;
}

.impact-text {
    margin : 0;
    padding : 0;
    display : inline-block;
    color : #3C0269;
    font-size : 18px;
    margin : 16px 6px 0 10px;
}

.progress-status-text {
    float : left;
    width : 100%;
    height : auto;
    margin : 20px 0 10px 0;
    text-align :center;
    font-size : 28px;
    color : #3C0269;
    font-weight : 900;
}

.admin-delete-button {
    float : right;
    width : 60px;
    height : 30px;
    margin : 15px 10px auto auto;
    background-color : #3C0269;
    border-radius : 8px;
}

.admin-delete-button-text {
    margin : 2px 0 0 14px;
    padding : 0;
    float : left;
    color : #FFFFFF;
}

#dummy-box {
    float : left;
    width : 100%;
    height : 810px;
    margin : 35px 0 0 0;
    background-color :#3C0269;
}
</style>