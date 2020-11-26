<template>
    <div id="navigator">
        <div id="navigator-container">
            <div id="navigator-name-title">Navigator</div>
            <div class="navigator-title-text-container">
                <p class="navigator-title-text">상품</p>
            </div>
            <div class="navigator-link-text-container">
                <a href="javascript:;" v-on:click="routeGoodAddButton"><p class="navigator-link-text">등록하기</p></a>
                <a href="javascript:;" v-on:click="routeGoodReadButton"><p class="navigator-link-text">목록보기</p></a>
            </div>
            <div v-if="isMasterAdmin" class="navigator-title-text-container">
                <p class="navigator-title-text">관리자</p>
            </div>
            <div v-if="isMasterAdmin" class="navigator-link-text-container">
                <a href="javascript:;" v-on:click="routeAdminAccountRegist"><p class="navigator-link-text">등록하기</p></a>
                <a href="javascript:;" v-on:click="routeAdminAccountRead"><p class="navigator-link-text">목록보기</p></a>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name : 'Navigator',
    props : ['isMasterAdmin'],
    methods : {
        routeGoodAddButton : function() {
            if(this.$route.name != 'GoodAdd') {
                this.$router.push({
                    name : 'GoodAdd'
                });
            }
        },
        routeGoodReadButton : function () {
            if(this.$route.name != 'GoodRead') {
                this.$router.push({
                    name : 'GoodRead'
                });
            }
        },
        routeGoodSearchButton : function () {
            if(this.$route.name != 'GoodSearch') {
                this.$router.push({
                    name : 'GoodSearch'
                });
            }
        },
        routeAdminAccountRegist : function () {
            if(this.$route.name != 'AccountRegist') {
                this.$router.push({
                    name : 'AccountRegist'
                });
            }
        },
        routeAdminAccountRead : function () {
            if(this.$route.name != 'AccountRead') {
                this.$router.push({
                    name : 'AccountRead'
                });
            }
        }
    }
}
</script>

<style lang="scss" scoped>
#navigator-container {
    float : left;
    width : 360px;
    height : 800px;
    margin : 0 0 auto 0;
    padding : 0;
    border : 2px solid #3C0269;
    border-radius : 8px;
}

#navigator-name-title {
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

.navigator-title-text-container {
    float : left;
    width : 330px;
    height : 50px;
    padding : 0 0 0 0;
    margin : 15px auto 0 15px;
    background-color : #3C0269;
    border-radius : 8px;
}

.navigator-title-text {
    float : left;
    display : block;
    margin : 4px 0 0 20px;
    padding : 0;
    font-size : 26px;
    font-weight : 700;
    color : #FFFFFF;
    width : auto;
    height : auto;
}

.navigator-link-text-container {
    float : left;
    width: 328px;
    height : 108px;
    margin : 10px 0 0 15px;
    padding : 0;
    border : 2px solid #3C0269;
    border-radius : 8px;
}

.navigator-link-text {
    float : left;
    width : 240px;
    display : block;
    font-size : 24px;
    color : #3C0269;
    margin : 8px 0 10px 20px;
}

.navigator-link-text:hover {
    color : #3C0269;
    font-weight : 800;
    cursor : pointer;
}

.navigator-link-text:active {
    color : #3C0269;
    font-weight : 800;
    cursor : pointer;
}
</style>