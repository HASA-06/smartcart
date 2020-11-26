<template>
    <div id="admin-status">
        <div id="admin-status-container">
            <p id="admin-status-title">Administrator</p>
            <p id="admin-status-contents"><span id="admin-status-name">{{ adminName }}</span> 관리자님, <br/>좋은하루 되세요 :)</p>
            <div class="admin-status-button" id="admin-info-modify-button">
                <p class="admin-status-button-text">정보 수정</p>
            </div>
            <div class="admin-status-button" id="admin-sign-out-button" v-on:click="onClickSignOutButton">
                <p class="admin-status-button-text">로그 아웃</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name : 'AdminStatus',
    props : ['adminName'],
    methods : {
        onClickSignOutButton : function() {
            var signOutAPIHeader = {
                headers : {
                token : this.$store.state.adminToken
                }
            };

            this.$axios.post(this.$store.state.host + this.$store.state.urls.adminsAccountsSignOut, null, signOutAPIHeader)
            .then(res => {
                if(res.status == 201) {
                    var localStorage = window.localStorage;
                    var sessionStorage = window.sessionStorage;
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminEmail');
                    localStorage.removeItem('adminName');
                    sessionStorage.removeItem('adminToken');
                    sessionStorage.removeItem('adminEmail');
                    sessionStorage.removeItem('adminName');
                    this.$store.commit('signOut');
                    this.$cookie.set('signInMaintenance', '');
                    this.$router.push({
                        name : 'Home'
                    });
                }
            })
            .catch(error => {
                if(error) {
                    console.log('Server error, please ask to developer');
                    alert('Server error, please ask to developer');
                }
            });
        }
    }
}
</script>

<style lang="scss" scoped>
#admin-status-container {
    float : left;
    width : 360px;
    height : 180px;
    border : 2px solid #3C0269;
    border-radius : 8px;
}

#admin-status-title {
    float : left;
    display : block;
    width : 360px;
    height : 50px;
    background-color : #3C0269;
    font-size : 28px;
    font-weight : 800;
    text-align : center;
    color : #FFFFFF;
    margin : 0;
    padding : 0;
}

#admin-status-contents {
    float : left;
    display : block;
    width : 340px;
    height : auto;
    font-size : 20px;
    margin : 5px 0 0 20px;
    padding : 0;
}

#admin-status-name {
    font-size : 26px;
    font-weight : 800;
    color : #3C0269;
}

.admin-status-button {
    float : left;
    width : 160px;
    height : 40px;
    background-color : #3C0269;
    border-radius : 4px;
}

.admin-status-button-text {
    float : left;
    display : block;
    width : 160px;
    height : auto;
    font-size : 18px;
    text-align : center;
    color : #FFFFFF;
    margin : 5px 0 0 0;
    padding : 0;
}

#admin-info-modify-button {
    margin : 5px 5px auto 15px;
}

#admin-info-modify-button:hover {
    cursor : pointer;
    font-weight : 900;
    background-color : #6103A8;
}

#admin-info-modify-button:active {
    cursor : pointer;
    font-weight : 900;
    background-color : #6103A8;
}

#admin-sign-out-button {
    margin : 5px auto 0 0;
}

#admin-sign-out-button:hover {
    cursor : pointer;
    font-weight : 900;
    background-color : #6103A8;
}

#admin-sign-out-button:active {
    cursor : pointer;
    font-weight : 900;
    background-color : #6103A8;
}
</style>