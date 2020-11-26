<template>
    <div id="client-header">
        <div id="client-header-container">
            <img id="client-header-company-logo" src="../assets/images/companys/logo.jpg" alt="no_image"/>
            <p id="client-header-title" v-on:click="homeButton">Smart Cart</p>
            <div id="client-header-horizontal-line"></div>
        </div>
    </div>
</template>

<script>
export default {
    name : 'ClientHeader',
    methods : {
        homeButton : function() {
            if(this.$store.state.user.token == '' &&this.$route.name != 'Home') {
                this.$router.push({
                    name : 'Home'
                });
            }
        }
    }
}
</script>

<style lang="scss" scoped>
#client-header-container {
    float : left;
    width : 100vw;
    height : 14vw;
}

#client-header-company-logo {
    float : left;
    max-width : 16.75vw;
    width : 16.75vw;
    height : 5vw;
    margin : 4.5vw 0 auto 2.5vw;
}

#client-header-title {
    width : 50vw;
    float : left;
    color : #3C0269;
    margin : 0 0 0 7vw;
    padding : 0;
    text-align : center;
    font-size : 8vw;
    font-weight : 900;
    text-shadow : 0.5vw 0.5vw 0.5vw #6103A8;
}

#client-header-title:hover {
    cursor : pointer;
}

#client-header-title:active {
    cursor : pointer;
}

#client-header-horizontal-line {
    float : left;
    width : 95vw;
    height : auto;
    margin : 1.5vw auto 0 2.5vw;
    border : 0.5vw solid #3C0269;
}

@media ( min-width : 768px ) {

}

@media ( min-width : 1024px ) {

}
</style>