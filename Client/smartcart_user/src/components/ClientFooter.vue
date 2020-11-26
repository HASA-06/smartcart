<template>
    <div id="client-footer">
        <div id="client-footer-container">
            <div class="client-footer-horizontal-line"></div>
            <p id="client-footer-button-left-margin" class="client-footer-button">회사소개</p>
            <div class="client-footer-vertical-line"></div>
            <p class="client-footer-button">개인정보처리방침</p>
            <div class="client-footer-vertical-line"></div>
            <p class="client-footer-button">이용약관</p>
            <div class="client-footer-vertical-line"></div>
            <p class="client-footer-button">기타1</p>
            <div id="client-footer-bottom-horizontal-line" class="client-footer-horizontal-line"></div>
            <p class="client-footer-contents">(주) 워너버스</p>
            <p class="client-footer-contents">고객센터 1555-0000</p>
        </div>
    </div>
</template>

<script>
export default {
    name : 'ClientFooter'
}
</script>

<style lang="scss" scoped>
#client-footer-container {
    float : left;
    width : 100vw;
    height : 50vw;
    background-color : #D8D8D8;
}

.client-footer-horizontal-line {
    float : left;
    width : 95vw;
    margin : 0 auto 0 2.5vw;
    border : 0.125vw solid #BDBDBD;
}

.client-footer-button {
    float : left;
    font-size : 3vw;
    color : #585858;
    margin : 0.5vw 0 0 0;
    padding : 0;
}

.client-footer-button:hover {
    cursor : pointer;
}

.client-footer-button:active {
    cursor : pointer;
}

#client-footer-button-left-margin {
    margin-left : 3vw;
}

.client-footer-vertical-line {
    float : left;
    margin : 1vw 1vw 0 1vw;
    height : 3.5vw;
    border : 0.125vw solid #BDBDBD;
}

#client-footer-bottom-horizontal-line {
    margin-top : 1vw;
}

.client-footer-contents {
    float : left;
    width : 97vw;
    margin : 1vw 0 0 3vw;
    color : #000000;
    font-size : 3.5vw;
}
</style>