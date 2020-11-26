<template>
    <div id="good-read">
        <div id="good-read-container">
            <p id="good-read-container-title">상품 목록</p>
            <div class="horizontal-line"></div>
            <div id="hidden-scroll-bar"></div>
            <div v-show="isAllGoodData" id="good-data-container" v-infinite-scroll="goodDataInfiniteScroll" infinite-scroll-disabled="isRealLastData" infinite-scroll-distance="0" infinite-scroll-throttle-delay="1000">
                <div class="good-data" v-for="(data) in goodDatas" :key="data.goodId" v-on:click="goodDataDetailInfoButton(data.goodId)">
                    <div class="color-box"></div>
                    <img class="good-image" :src="data.goodImageUrl" alt="no_image"/>
                    <div class="good-info about-good">
                        <div class="impact-text">상품번호</div> {{ data.goodId }} 
                        <div class="impact-text">상품명</div> {{ data.goodName }} 
                    </div>
                    <div class="good-info about-company">
                        <div class="impact-text">회사번호</div> {{ data.companyId }} 
                        <div class="impact-text">회사명</div> {{ data.companyName }}
                    </div>
                </div>
                <div v-show="isLastGoodData" id="progress-bar">
                    Loading ......
                </div>
                <div v-show="!isLastGoodData && !isRealLastData" id="good-data-end-text">
                    Please scroll down :(
                </div>
                <div v-show="!isLastGoodData && isRealLastData" id="good-data-end-text">
                    It's last data :)
                </div>
                <div v-show="isNothing()" id="dummy-box">
                </div>
            </div>
            <div v-show="!isAllGoodData" id="good-data-container">
                <img id="good-data-image" :src="goodData.goodImageUrl" alt="no_image"/>
                <div class="good-data-info-box-label">상품번호</div>
                <input class="good-data-info-box" id="good-data-id" :value="goodData.goodId" readonly/>
                <div class="good-data-info-box-label">상품이름</div>
                <input class="good-data-info-box" id="good-data-name" v-model.lazy="goodData.goodName"/>
                <div class="good-data-info-box-label">상품가격</div>
                <input class="good-data-info-box" id="good-data-price" v-model.lazy="goodData.goodPrice"/>
                <div class="good-data-info-box-label">상품개수</div>
                <input class="good-data-info-box" id="good-data-count" :value="goodData.goodCount" readonly/>
                <div class="good-data-info-box-label">상품판매상태</div>
                <input class="good-data-info-box" id="good-data-sale-status" v-model.lazy="goodData.goodSaleStatus"/>
                <div class="good-data-barcode-info-box-label">바코드번호</div>
                <div id="barcode-nubmer-container">
                    <input class="good-data-barcode-info-box" id="good-data-nation-code" :value="goodData.nationCode" readonly/>
                    <input class="good-data-barcode-info-box" id="good-data-company-code" :value="goodData.companyCode" readonly/>
                    <input class="good-data-barcode-info-box" id="good-data-good-code" :value="goodData.goodCode" readonly/>
                    <input class="good-data-barcode-info-box" id="good-data-checkDigit" :value="goodData.checkDigit" readonly/>
                </div>
                <div class="good-data-info-box-label">회사번호</div>
                <input class="good-data-info-box" id="good-data-company-id" :value="goodData.companyId" readonly/>
                <div class="good-data-info-box-label">회사이름</div>
                <input class="good-data-info-box" id="good-data-company-name" v-model.lazy="goodData.companyName"/>
                <div class="good-data-info-box-label">회사상품개수</div>
                <input class="good-data-info-box" id="good-data-company-good-count" :value="goodData.companyGoodCount" readonly/>
                <div id="good-data-button-container">
                    <div class="good-data-button" v-on:click="backToAllGoodDataButton">
                        뒤로가기
                    </div>
                    <div class="good-data-button" v-on:click="updateGoodDataButton">
                        수정하기
                    </div>
                    <div class="good-data-button" v-on:click="deleteGoodDataButton">
                        삭제하기
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name : 'GoodRead',
    data : function() {
        return {
            isAllGoodData : true,
            goodDatas : [],
            goodData : [],
            isLastGoodData : false,
            isRealLastData : false
        }
    },
    created () {
        this.isRealLastData = false;
    },
    methods : {
        goodDataInfiniteScroll : function () {
            if(!this.isRealLastAdminData) {
                this.isLastGoodData = true;
                this.getMoreGoodData();
            }
        },
        getMoreGoodData : function () {
            if(this.goodDatas.length == 0) {
                var goodReadAPIParams = {
                    params : {

                    },
                    headers : {
                        token : this.$store.state.adminToken
                    }
                };

                this.$axios.get(this.$store.state.host + this.$store.state.urls.adminsGoodsRead, goodReadAPIParams)
                .then(res => {
                    if(res.status == 200) {
                        setTimeout(() => {
                            this.isLastGoodData = false;

                            this.goodDatas = (res.data.data === undefined) ? [] : res.data.data;
                            if(this.goodDatas.length == 0) {
                                this.isRealLastData = true;
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
                                            if(this.$route.name != 'GoodRead') {
                                                this.$router.push({
                                                    name : 'GoodRead'
                                                });
                                            }
                                        } else if(this.$cookie.get('signInMaintenance') == 'Y') {
                                            var storage = window.localStorage;
                                            storage.setItem('adminToken', res.data.data);
                                            this.$store.commit('setToken', {adminToken : res.data.data, adminEmail : storage.getItem('adminEmail'), adminName : storage.getItem('adminName')});
                                            alert('토큰이 만료되었습니다. 다시 시도해보세요.');
                                            if(this.$route.name != 'GoodRead') {
                                                this.$router.push({
                                                    name : 'GoodRead'
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
                var goodReadAPIParams = {
                    params : {
                        lastGoodId : this.goodDatas[this.goodDatas.length - 1].goodId
                    },
                    headers : {
                        token : this.$store.state.adminToken
                    }
                };
                this.$axios.get(this.$store.state.host + this.$store.state.urls.adminsGoodsRead, goodReadAPIParams)
                .then(res => {
                    if(res.status == 200) {
                        if(res.data.data.length == 0) {
                            this.isRealLastData = true;
                            this.isLastGoodData = false;
                        } else {
                            setTimeout(() => {
                                this.isLastGoodData = false;

                                this.goodDatas = this.goodDatas.concat(res.data.data);
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
                                            if(this.$route.name != 'GoodRead') {
                                                this.$router.push({
                                                    name : 'GoodRead'
                                                });
                                            }
                                        } else if(this.$cookie.get('signInMaintenance') == 'Y') {
                                            var storage = window.localStorage;
                                            storage.setItem('adminToken', res.data.data);
                                            this.$store.commit('setToken', {adminToken : res.data.data, adminEmail : storage.getItem('adminEmail'), adminName : storage.getItem('adminName')});
                                            alert('토큰이 만료되었습니다. 다시 시도해보세요.');
                                            if(this.$route.name != 'GoodRead') {
                                                this.$router.push({
                                                    name : 'GoodRead'
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
            }
        },
        goodDataDetailInfoButton : function (goodId) {
            this.isAllGoodData = false;
            this.isRealLastData = false;
            this.goodDatas = [];
            
            var goodReadAPIParams = {
                params : {
                    goodId : goodId
                },
                headers : {
                    token : this.$store.state.adminToken
                }
            };

            this.$axios.get(this.$store.state.host + this.$store.state.urls.adminsGoodsRead, goodReadAPIParams)
            .then(res => {
                this.goodData = res.data.data[0];
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
                                        if(this.$route.name != 'GoodRead') {
                                            this.$router.push({
                                                name : 'GoodRead'
                                            });
                                        }
                                    } else if(this.$cookie.get('signInMaintenance') == 'Y') {
                                        var storage = window.localStorage;
                                        storage.setItem('adminToken', res.data.data);
                                        this.$store.commit('setToken', {adminToken : res.data.data, adminEmail : storage.getItem('adminEmail'), adminName : storage.getItem('adminName')});
                                        alert('토큰이 만료되었습니다. 다시 시도해보세요.');
                                        if(this.$route.name != 'GoodRead') {
                                            this.$router.push({
                                                name : 'GoodRead'
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
                        } else {
                            console.log('400떳다 확인해라');
                        }
                    } else {
                        console.log('Server error, please ask to developer');
                        alert('Server error, please ask to developer');
                    }
                }
            })
        },
        backToAllGoodDataButton : function () {
            document.getElementById('good-data-container').scrollTo(0, 0);
            this.isAllGoodData = true;
            this.goodData = [];
            this.goodDatas = [];
            this.isRealLastData = false;
            this.isLastGoodData = false;
        },
        updateGoodDataButton : function () {
            var goodUpdateAPIParams = {
                goodDatas : this.goodData
            }
            var goodUpdateAPIHeader = {
                headers : {
                    token : this.$store.state.adminToken
                }
            };

            this.$axios.post(this.$store.state.host + this.$store.state.urls.adminsGoodsUpdate, goodUpdateAPIParams, goodUpdateAPIHeader)
            .then(res => {
                if(res.status == 201) {
                    alert('수정이 완료되었습니다.');
                    this.isAllGoodData = true;
                    this.isRealLastData = false;
                    this.goodData = [];
                    this.goodDatas = [];
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
                                        if(this.$route.name != 'GoodRead') {
                                            this.$router.push({
                                                name : 'GoodRead'
                                            });
                                        }
                                    } else if(this.$cookie.get('signInMaintenance') == 'Y') {
                                        var storage = window.localStorage;
                                        storage.setItem('adminToken', res.data.data);
                                        this.$store.commit('setToken', {adminToken : res.data.data, adminEmail : storage.getItem('adminEmail'), adminName : storage.getItem('adminName')});
                                        alert('토큰이 만료되었습니다. 다시 시도해보세요.');
                                        if(this.$route.name != 'GoodRead') {
                                            this.$router.push({
                                                name : 'GoodRead'
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
                        } else {
                            alert('충분한 데이터가 들어오지않았습니다,관리자에게 문의하세요!');
                        }
                    } else {
                        console.log('Server error, please ask to developer');
                        alert('Server error, please ask to developer');
                    }
                }
            })
        },
        deleteGoodDataButton : function(target) {
            var goodDeleteAPIParams = {
                goodDatas : this.goodData
            };
            var goodDeleteAPIHeader = {
                headers : {
                    token : this.$store.state.adminToken
                }
            };

            this.$axios.post(this.$store.state.host + this.$store.state.urls.adminsGoodsDelete, goodDeleteAPIParams, goodDeleteAPIHeader)
            .then(res => {
                if(res.status == 201) {
                    alert('삭제가 완료되었습니다');
                    document.getElementById('good-data-container').scrollTo(0, 0);
                    this.goodDatas = [];
                    this.goodData = [];
                    this.isRealLastData = false;
                    this.isAllGoodData = true;
                }
            })
            .catch(error => {
                if(error) {
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
                                        if(this.$route.name != 'GoodRead') {
                                            this.$router.push({
                                                name : 'GoodRead'
                                            });
                                        }
                                    } else if(this.$cookie.get('signInMaintenance') == 'Y') {
                                        var storage = window.localStorage;
                                        storage.setItem('adminToken', res.data.data);
                                        this.$store.commit('setToken', {adminToken : res.data.data, adminEmail : storage.getItem('adminEmail'), adminName : storage.getItem('adminName')});
                                        alert('토큰이 만료되었습니다. 다시 시도해보세요.');
                                        if(this.$route.name != 'GoodRead') {
                                            this.$router.push({
                                                name : 'GoodRead'
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
                    } else {
                        console.log('Server error, please ask to developer');
                        alert('Server error, please ask to developer');
                    }
                }
            });
        },
        isNothing : function() {
            if(this.goodDatas.length == 0 && !this.isRealLastData) return true;
            else return false;
        }
    }
}
</script>

<style lang="scss" scoped>
#good-read-container {
    float : right;
    width : 876px;
    height : 1028px;
    border : 2px solid #3C0269;
    border-radius : 8px;
}

#good-read-container-title {
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

#good-data-container {
    float : left;
    width : 876px;
    height : 908px;
    overflow-y : scroll;
}

.good-data {
    float : left;
    width : 800px;
    height : 100px;
    border : 1px solid #3C0269;
    border-radius : 8px;
    margin : 0 auto 10px 38px;
}

.good-data:hover {
    cursor : pointer;
    border-radius : 2px solid #3C0269;
}

.good-data:active {
    cursor : pointer;
    border-radius : 2px solid #3C0269;
}

.color-box {
    float : left;
    width : 20px;
    height : 100%;
    background-color : #3C0269;
    border-radius : 8px 0 0 8px;
}

.good-image {
    float : left;
    width : 80px;
    height : 80px;
    max-width : 80px;
    margin : 10px;
}

.good-info {
    float : left;
    width : 670px;
    font-size : 20px;
}

.about-good {
    margin : 12px auto 8px 0;
}

.about-company {
    margin : 8px auto 12px 0;
}

.impact-text {
    display : inline-block;
    color : #3C0269;
    font-weight : 900;
    margin : 0 10px 0 10px;
}

#progress-bar {
    float : left;
    width : 100%;
    height : auto;
    margin : 20px 0 10px 0;
    text-align :center;
    font-size : 28px;
    color : #3C0269;
    font-weight : 900;
}

#good-data-end-text {
    float : left;
    width : 100%;
    height : auto;
    margin : 20px 0 10px 0;
    text-align :center;
    font-size : 28px;
    color : #3C0269;
    font-weight : 900;
}

.good-data-button {
    float : left;
    width : 220px;
    height : 40px;
    text-align : center;
    background-color : #3C0269;
    color : #FFFFFF;
    font-size : 24px;
    border-radius : 8px;
    margin-right : 20px;
}

.good-data-button:hover {
    cursor : pointer;
    background-color : #6103A8;
}

.good-data-button:active {
    cursor : pointer;
    background-color : #6103A8;
}

.good-data-info-box {
    float : left;
    width : 580px;
    height : 40px;
    border-radius : 8px;
    padding-left : 20px;
    font-size : 18px;
    border : 1px solid #3C0269;
    margin : 0 0 20px 0;
}

.good-data-barcode-info-box {
    float : left;
    width : 115px;
    height : 40px;
    margin : 0 18px 20px 0;
    border-radius : 8px;
    padding-left : 20px;
    font-size : 18px;
    border : 1px solid #3C0269;
    font-family : 'Noto Sans KR', sans-serif;
}

.good-data-info-box:hover {
    border : 2px solid #6103A8;
    font-size : 20px;
    color : #6103A8;
    cursor : pointer;
    font-family : 'Noto Sans KR', sans-serif;
}

.good-data-info-box:active {
    border : 2px solid #6103A8;
    font-size : 20px;
    color : #6103A8;
    cursor : pointer;
    font-family : 'Noto Sans KR', sans-serif;
}

.good-data-barcode-info-box:hover {
    border : 2px solid #6103A8;
    font-size : 18px;
    color : #6103A8;
    cursor : pointer;
    font-family : 'Noto Sans KR', sans-serif;
}

.good-data-barcode-info-box:active {
    border : 2px solid #6103A8;
    font-size : 18px;
    color : #6103A8;
    cursor : pointer;
    font-family : 'Noto Sans KR', sans-serif;
}

#good-data-image {
    float : left;
    width : 300px;
    height : 300px;
    max-width : 300px;
    margin : 0 270px 20px 288px;
}

.good-data-info-box-label {
    float : left;
    display : block;
    width : 200px;
    height : 40px;
    margin : 0 0 0 26px;
    padding : 0;
    font-size : 22px;
}

.good-data-barcode-info-box-label {
    float : left;
    display : block;
    width : 200px;
    height : 40px;
    margin : 0 0 0 26px;
    padding : 0;
    font-size : 22px;
}

#good-data-button-container {
    float : left;
    width : 783px;
    height : auto;
    margin : 20px 0 40px 76px;
}

#barcode-nubmer-container {
    float : left;
}

#dummy-box {
    float : left;
    width : 100%;
    height : 810px;
    margin : 35px 0 0 0;
    background-color :#3C0269;
}
</style>