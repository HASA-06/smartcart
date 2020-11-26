<template>
    <div id="client-footer">
        <div id="client-footer-container">
            <p class="client-footer-link-text" id="">회사소개</p>
            <div class="vertical-line"></div>
            <p class="client-footer-link-text" id="">개인정보처리방침</p>
            <div class="vertical-line"></div>
            <p class="client-footer-link-text" id="">이용약관</p>
            <div class="vertical-line"></div>
            <p class="client-footer-link-text" id="">기타1</p>
            <div class="vertical-line"></div>
            <p class="client-footer-link-text" id="">기타2</p>
            <div class="vertical-line"></div>
            <p class="client-footer-link-text" id="">기타3</p>
            <div class="horizontal-line"></div>
            <div id="client-footer-info-container">
                <div id="client-footer-dummy"></div>
                <p class="client-footer-info-text" id="client-footer-info-company-name">(주)워너버스</p>
                <p class="client-footer-info-text" id="client-footer-info-customer-center-phone-number">고객센터 1555-0000</p>
                <p class="client-footer-info-text" id="client-footer-info-company-representative">대표자 장환일</p>    
                <p class="client-footer-info-text" id="client-footer-info-company-phone-number">회사 대표번호 000-1111-2222</p>
                <p class="client-footer-info-text" id="client-footer-info-company-address">주소 : 서울특별시 어느시 어느구 어느길</p>
                <p class="client-footer-info-text" id="client-footer-info-etc">사업자등록번호 000-00-00000 | Fax 00-1111-2222 | Email : one_of_us@email.com</p>
            </div>
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
    width : 1280px;
    height : 600px;
    border-top : 1px solid #A4A4A4;
}

.client-footer-link-text {
    display : block;
    float : left;
    width : auto;
    height : auto;
    margin : 12px 4px 12px 4px;
    padding : 0;
    color : #6E6E6E;
    font-size : 14px;
}

.vertical-line {
    float : left;
    width : 0.5px;
    height : 12px;
    margin : 18px 12px auto 12px;
    border : 0.25px solid #A4A4A4;
}

.horizontal-line {
    float : left;
    width: 1280px;
    border : 0.5px solid #A4A4A4;
}

#client-footer-info-container {
    float : left;
    width : 1280px;
    height : auto;
    margin : 10px 0 0 0;
}

.client-footer-info-text {
    display : block;
    float : left;
    width : 1180px;
    height : auto;
    margin : 2px 0 2px 20px;
    padding : 0;
    color : #BDBDBD;
    font-size : 14px;
}

#client-footer-info-company-name {
    color : #000000;
    font-size : 18px;
    margin-left : 0px;
}

#client-footer-info-customer-center-phone-number {
    color : #000000;
    font-size : 18px;
    margin-left : 0px;
}

#client-footer-dummy {
    float : left;
    width : 10px;
    height : 156px;
    margin : 2px 10px 0 0;
    background-color : #3C0269;
}
</style>