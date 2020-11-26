<template>
    <div id="client-header">
        <div class="dummy-box" id="client-top-container">
        </div>
            <div id="client-header-container">
                <img id="oneofus-company-logo" src="../assets/images/one_of_us_companys/logo.jpg"/>
                <a href="javascript:;" v-on:click="routeHomeButton">
                    <p id="client-header-title">Smart Cart</p>
                </a>
                <p id="client-header-sub-title">Admin</p>
            </div>
        <div class="dummy-box" id="client-bottom-container">
        </div>
    </div>
</template>

<script>
export default {
    name : 'ClientHeader',
    methods : {
        routeHomeButton : function() {
            var adminToken = this.$store.state.adminToken;
            if(adminToken === undefined || adminToken == '' || adminToken == null) {
                if(this.$route.name != 'Home') {
                    this.$router.push({
                        name : 'Home'
                    });
                }
            } else {
                if(this.$route.name != 'GoodAdd') {
                    this.$router.push({
                        name : 'GoodAdd'
                    });
                }
            }
            
        }
    }
}
</script>

<style lang="scss" scoped>
#client-header-container {
    float : left;
    width : 1280px;
    height : 120px;
    margin : 0;
    padding : 0;
    background-color : #FFFFFF;
}

.dummy-box {
    float : left;
    background-color : #3C0269;
}

#client-top-container {
    width : 1280px;
    height : 40px;
    margin : 0;
    padding : 0;
    border-radius : 4px;
}

#oneofus-company-logo {
    float : left;
    width : 240px;
    height : 60px;
    max-width : 100%;
    margin : 26px 0 40px 40px;
}

#client-header-title {
    display : block;
    float : left;
    width : 404px;
    height : auto;
    text-align : center;
    text-shadow : 2px 2px #6103A8;
    font-size : 80px;
    font-weight : 900;
    color : #3C0269;
    margin : 0 0 0 160px;
}

#client-header-sub-title {
    display : block;
    float : left;
    width : 100px;
    text-align : center;
    text-shadow : 1px 1px;
    height : auto;
    font-size : 32px;
    font-weight : 900;
    color : #3C0269;
    margin : 58px auto 0 40px;
}

#admin-name-title {
    float : left;
    display: block;
    font-size : 20px;
    font-weight : 600;
    color : #3C0269;
    margin : 20px auto 0 84px;
    padding : 0;
}
#admin-name {
    float : left;
    display : block;
    font-size : 36px;
    font-weight : 800;
    color : #3C0269;
    margin : 4px auto 0 84px;
    padding : 0;
}

#client-bottom-container {
    width : 1280px;
    height : 40px;
    margin : 0;
    padding : 0;
    border-radius : 4px;
}
</style>