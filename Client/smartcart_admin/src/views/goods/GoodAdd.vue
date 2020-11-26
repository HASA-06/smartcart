<template>
    <div id="good-add">
        <div id="good-add-container">
            <p id="good-container-title">상품 등록하기</p>
            <div class="horizontal-line"></div>
            <div class="input-box-container" v-if="!isRegisteredBarcode">
                <p class="input-box-label">바코드 번호</p>
                <input type="text" class="good-add-input-box" v-model.lazy="barcodeNumber"/>
                <p class="input-box-explanation" v-show="!isBarcodeError">{{ barcodeExplainText }}</p>
                <p class="input-box-error" v-show="isBarcodeError"> {{ barcodeErrorText }} </p>
            </div>
            <div v-if="!isNewBarcode && !isRegisteredBarcode" id="barcode-check-button" v-on:click="barcodeCheckButton">
                <p id="barcode-check-button-text">
                    바코드 체크하기
                </p>
            </div>
            <div class="input-box-container" v-if="isRegisteredBarcode">
                <p class="input-box-label">상품 수량</p>
                <input type="text" class="good-add-input-box" v-model.lazy="goodCount"/>
                <p class="input-box-explanation" v-show="!isGoodCountError">추가할 상품의 수량을 입력해 주세요</p>
                <p class="input-box-error" v-show="isGoodCountError"> {{ goodCountErrorText }} </p>
            </div>
            <div v-if="isRegisteredBarcode" class="good-create-button" v-on:click="goodCreateButton">
                <p class="good-create-button-text">수량 추가</p>
            </div>
            <div v-if="isRegisteredBarcode" class="back-button" v-on:click="backButton">
                <p class="back-button-text">뒤로</p>
            </div>
            <div v-if="isRegisteredBarcode" id="color-box2"></div>
            <div v-if="!isNewBarcode && !isRegisteredBarcode" id="hide-box"></div>
            <div v-if="isNewBarcode" id="additional-input-box-container">
                <div class="input-box-container">
                    <p class="input-box-label">상품명</p>
                    <input type="text" class="good-add-input-box" v-model.lazy="goodName"/>
                    <p class="input-box-explanation" v-show="!isGoodNameError">상품의 이름을 입력해주세요</p>
                    <p class="input-box-error" v-show="isGoodNameError"> {{ goodNameErrorText }} </p>
                </div>
                <div class="input-box-container">
                    <p class="input-box-label">상품 가격</p>
                    <input type="text" class="good-add-input-box" v-model.lazy="goodPrice"/>
                    <p class="input-box-explanation" v-show="!isGoodPriceError">상품의 이름을 입력해주세요</p>
                    <p class="input-box-error" v-show="isGoodPriceError"> {{ goodPriceErrorText }} </p>
                </div>
                <div class="input-box-container">
                    <p class="input-box-label">상품 제조 회사명</p>
                    <input type="text" class="good-add-input-box" v-model.lazy="companyName"/>
                    <p class="input-box-explanation" v-show="!isCompanyNameError">상품을 제조한 회사명을 입력해주세요</p>
                    <p class="input-box-error" v-show="isCompanyNameError"> {{ companyNameErrorText }} </p>
                </div>
                <div id="good-image-file-input-box" class="input-box-container">
                    <p class="input-box-label">상품 이미지</p>
                    <label for="good-image-file-input">Choose Image here!</label>
                    <input id="good-image-file-input" type="file" ref="file" class="good-add-input-box" v-on:change="handleFileUpload"/>
                    <p class="input-box-explanation" v-show="!isImageFileError">상품을 대표할 이미지 파일을 선택해주세요</p>
                    <p class="input-box-error" v-show="isImageFileError"> {{ imageFileErrorText }} </p>
                </div>
                <div class="good-create-button" v-on:click="goodCreateButton">
                    <p class="good-create-button-text">상품 등록하기</p>
                </div>
                <div class="back-button" v-on:click="backButton">
                    <p class="back-button-text">뒤로</p>
                </div>
                <div id="color-box"></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name : 'GoodAdd',
    data : function() {
        return {
            isNewBarcode : false,
            isRegisteredBarcode : false,
            goodType : '',
            barcodeExplainText : '등록하기에 앞서서, 먼저 바코드 번호를 조회해 주세요 (직접 입력 혹은 리더기를 사용하세요)',
            barcodeErrorText : '바코드 번호가 아닙니다. 다시 확인해보세요 :)',
            isBarcodeError : false,
            barcodeNumber : '',
            barcodeData : {},
            goodCount : '',
            isGoodCountError : false,
            goodCountErrorText : '수량은 필수입니다',
            goodName : '',
            isGoodNameError : false,
            goodNameErrorText : '상품명은 필수입니다',
            goodPrice : '',
            isGoodPriceError : false,
            goodPriceErrorText : '상품 가격은 필수입니다',
            companyName : '',
            isCompanyNameError : false,
            companyNameErrorText : '회사 이름은 필수입니다',
            isImageFileError : false,
            imageFileErrorText : '이미지 파일은 필수입니다',
            imageFile : '',
            goodId : ''
        }
    },
    created () {
        this.$barcodeScanner.init(this.onBarcodeScanned)
    },
    destroyed () {
        this.$barcodeScanner.destroy();
    },
    methods : {
        onBarcodeScanned : function(barcode) {
            console.log(barcode);
        },
        resetBarcode : function() {
            var barcode = this.$barcodeScanner.getPreviousCode();
        },
        barcodeCheckButton : function() {
            var barcodeCheckParams = {
                params : {
                    goodBarcodeNumber : this.barcodeNumber
                },
                headers : {
                    token : this.$store.state.adminToken
                }
            };

            this.$axios.get(this.$store.state.host + this.$store.state.urls.adminsGoodsCheck, barcodeCheckParams)
            .then(res => {
                if(res.status == 200){
                    this.isBarcodeError = false;
                    this.barcodeData = res.data.data;

                    if(res.data.type == 'Registered') {
                        this.isRegisteredBarcode = true;
                        this.goodId = res.data.goodId;
                        this.barcodeExplainText = '기존에 등록된 상품입니다. 추가할 수량을 입력해 주세요'
                        this.goodType = res.data.type;
                    } else if(res.data.type == 'New') {
                        this.isNewBarcode = true;
                        this.barcodeExplainText = '새로운 상품입니다. 나머지 정보를 채워주세요'
                        this.goodType = res.data.type;
                    }
                }
            })
            .catch(error => {
                if(error) {
                    console.log(error.response.data);
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
                                        if(this.$route.name != 'GoodAdd') {
                                            this.$router.push({
                                                name : 'GoodAdd'
                                            });
                                        } else {
                                            alert('토큰이 만료되었습니다. 다시 시도해보세요.');
                                        }
                                    } else if(this.$cookie.get('signInMaintenance') == 'Y') {
                                        var storage = window.localStorage;
                                        storage.setItem('adminToken', res.data.data);
                                        this.$store.commit('setToken', {adminToken : res.data.data, adminEmail : storage.getItem('adminEmail'), adminName : storage.getItem('adminName')});
                                        if(this.$route.name != 'GoodAdd') {
                                            this.$router.push({
                                                name : 'GoodAdd'
                                            });
                                        } else {
                                            alert('토큰이 만료되었습니다. 다시 시도해보세요.');
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
                        } else {
                        this.isBarcodeError = true;
                        }
                    } else if(error.response.status == 500) {
                        console.log('Server error, please ask to developer');
                        alert('Server error, please ask to developer');
                    } else {
                        console.log('Server error, please ask to developer');
                        alert('Server error, please ask to developer');
                    }
                }
            });
        },
        handleFileUpload : function() {
            this.imageFile = this.$refs.file.files[0];
        },
        goodCreateButton : function () {
            if(this.isNewBarcode) {
                var goodCreateHeader = {
                    headers : {
                        'Content-Type' : 'multipart/form-data',
                        token : this.$store.state.adminToken
                    }
                };

                var goodCreateData = new FormData();
                goodCreateData.append('type', this.goodType);
                goodCreateData.append('goodImage', this.imageFile);
                goodCreateData.append('goodName', this.goodName);
                goodCreateData.append('goodPrice', this.goodPrice);
                goodCreateData.append('companyName', this.companyName);
                goodCreateData.append('nationCode', this.barcodeData.nationCode);
                goodCreateData.append('companyCode', this.barcodeData.companyCode);
                goodCreateData.append('goodCode', this.barcodeData.goodCode);
                goodCreateData.append('checkDigit', this.barcodeData.checkDigit);

                this.$axios.post(this.$store.state.host + this.$store.state.urls.adminsGoodsCreate, goodCreateData, goodCreateHeader)
                .then(res => {
                    if(res.status == 201) {
                        alert('상품등록이 완료되었습니다');
                        location.reload();
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
                                            if(this.$route.name != 'GoodAdd') {
                                                this.$router.push({
                                                    name : 'GoodAdd'
                                                });
                                            } else {
                                                alert('토큰이 만료되었습니다. 다시 시도해보세요.');
                                            }
                                        } else if(this.$cookie.get('signInMaintenance') == 'Y') {
                                            var storage = window.localStorage;
                                            storage.setItem('adminToken', res.data.data);
                                            this.$store.commit('setToken', {adminToken : res.data.data, adminEmail : storage.getItem('adminEmail'), adminName : storage.getItem('adminName')});
                                            if(this.$route.name != 'GoodAdd') {
                                                this.$router.push({
                                                    name : 'GoodAdd'
                                                });
                                            } else {
                                                alert('토큰이 만료되었습니다. 다시 시도해보세요.');
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
                            } else {
                                this.isGoodNameError = true;
                                this.isGoodPriceError = true;
                                this.isCompanyNameError = true;
                                this.isImageFileError = true;
                            }
                        } else if(error.response.status == 500) {
                            console.log('Server error, please ask to developer');
                            alert('Server error, please ask to developer');
                        } else {
                            console.log('Server error, please ask to developer');
                            alert('Server error, please ask to developer');
                        }
                    }
                });
            } else if(this.isRegisteredBarcode) {
                var goodCreateHeader = {
                    headers : {
                        token : this.$store.state.adminToken
                    }
                }

                var goodCreateParams = {
                    goodId : this.goodId,
                    goodCount : this.goodCount
                }

                this.$axios.post(this.$store.state.host + this.$store.state.urls.adminsGoodsCreate, goodCreateParams, goodCreateHeader)
                .then(res => {
                    if(res.status == 201) {
                        alert('상품 수량 추가가 완료되었습니다');
                        location.reload();
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
                                            if(this.$route.name != 'GoodAdd') {
                                                this.$router.push({
                                                    name : 'GoodAdd'
                                                });
                                            } else {
                                                alert('토큰이 만료되었습니다. 다시 시도해보세요.');
                                            }
                                        } else if(this.$cookie.get('signInMaintenance') == 'Y') {
                                            var storage = window.localStorage;
                                            storage.setItem('adminToken', res.data.data);
                                            this.$store.commit('setToken', {adminToken : res.data.data, adminEmail : storage.getItem('adminEmail'), adminName : storage.getItem('adminName')});
                                            if(this.$route.name != 'GoodAdd') {
                                                this.$router.push({
                                                    name : 'GoodAdd'
                                                });
                                            } else {
                                                alert('토큰이 만료되었습니다. 다시 시도해보세요.');
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
                            } else {
                                this.isGoodCountError = true;
                            }
                        } else if(error.response.status == 500) {
                            console.log('Server error, please ask to developer');
                            alert('Server error, please ask to developer');
                        } else {
                            console.log('Server error, please ask to developer');
                            alert('Server error, please ask to developer');
                        }
                    }
                });
            }
        },
        backButton : function() {
            this.isNewBarcode = false;
            this.isRegisteredBarcode = false;
            this.isGoodPriceError = false;
            this.isCompanyNameError = false;
            this.isImageFileError = false;
            this.isBarcodeError = false;
            this.isGoodNameError = false;
            this.isGoodCountError = false;
            this.barcodeExplainText = '등록하기에 앞서서, 먼저 바코드 번호를 조회해 주세요 (직접 입력 혹은 리더기를 사용하세요)';
            this.barcodeNumber = '';
            this.goodType = '';
            this.goodCount = '';
            this.companyName = '';
            this.goodName = '';
            this.imageFile = '';
            this.goodId = '';
        }
    }
}
</script>

<style lang="scss" scoped>
#good-add-container {
    float : right;
    width : 876px;
    height : 1028px;
    border : 2px solid #3C0269;
    border-radius : 8px;
}

#good-container-title {
    float : left;
    display : block;
    width : 100%;
    margin : 20px 0 0 0;
    padding : 0;
    font-size : 46px;
    color : #3C0269;
    font-weight : 900;
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

#barcode-check-button {
    float : left;
    width : 400px;
    height : 50px;
    margin : 0 auto 0 240px;
    background-color : #3C0269;
    border-radius : 8px;
}

#barcode-check-button:hover {
    background-color : #6103A8;
    cursor : pointer;
}

#barcode-check-button:active {
    background-color : #6103A8;
    cursor : pointer;
}

#barcode-check-button-text {
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

#hide-box {
    float : left;
    width : 100%;
    margin : 40px 0 0 0;
    height : 698px;
    background-color : #3C0269;
}

#additional-input-box-container {
    float : left;
    width : 100%;
    margin : 0 0 0 0;
    height : 788px;
}

#good-image-file-input-box label {
    float : left;
    width : 400px;
    height : 40px;
    margin : 0;
    color : #FFFFFF;
    font-family : 'Noto Sans KR', sans-serif;
    font-size : 20px;
    vertical-align : middle;
    text-align : center;
    background-color : #3C0269;
    cursor : pointer;
    border : 2px solid #6103A8;
    border-radius : 8px;
}

#good-image-file-input-box label:hover {
    cursor : pointer;
    background-color : #6103A8;
}

#good-image-file-input-box label:active {
    cursor : pointer;
    background-color : #6103A8;
}

#good-image-file-input-box input[type="file"] {
    float : left;
    width : 0px;
    height : 0px;
    padding : 0;
    margin : -1px;
    overflow : hidden;
    clip : rect(0, 0, 0, 0);
    border : 0;
}

.good-create-button {
    float : left;
    width: 380px;
    height : 60px;
    margin : 20px 40px 40px 128px;
    background-color : #3C0269;
    border-radius : 8px;
}

.good-create-button:hover {
    cursor : pointer;
    background-color : #6103A8;
}

.good-create-button:active {
    cursor : pointer;
    background-color : #6103A8;
}

.good-create-button-text {
    float : left;
    width : 100%;
    display : block;
    height : auto;
    text-align : center;
    font-size : 32px;
    color : #FFFFFF;
    font-weight : 800;
    margin : 4px 0 0 0;
    padding : 0;
}

.back-button {
    float : left;
    width: 200px;
    height : 60px;
    margin : 20px auto 40px 0;
    background-color : #3C0269;
    border-radius : 8px;
}

.back-button:hover {
    cursor : pointer;
    background-color : #6103A8;
}

.back-button:active {
    cursor : pointer;
    background-color : #6103A8;
}

.back-button-text {
    float : left;
    width : 100%;
    display : block;
    height : auto;
    text-align : center;
    font-size : 32px;
    color : #FFFFFF;
    font-weight : 800;
    margin : 4px 0 0 0;
    padding : 0;
}

#color-box {
    float : left;
    width : 100%;
    height : 188px;
    background-color : #3C0269;
}

#color-box2 {
    float : left;
    width : 100%;
    height : 668px;
    background-color : #3C0269;
}
</style>