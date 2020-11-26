<template>
    <div id="shopping-list">
        <div id="shopping-list-container">
            <div id="shopping-list-user-data">
                <p id="shopping-list-user-name">소중한 고객 <span>{{ userName }}</span> 님,<br/> 결제진행 전 확인해주세요 :)</p>
                <p v-show="isBeforeBuy" id="shopping-list-total-count">총 구매수량 <span>{{ goodTotalCount }}</span> 개</p>
                <p v-show="isBeforeBuy" id="shopping-list-total-price">총 구매가격 <span>{{ goodTotalPrice }}</span> 원</p>
                <div id="barcode-container">
                    <barcode class="vue-barcode-element" v-show="!isBeforeBuy" fontSize="16" height="25" v-bind:value="userId">
                        This is error fo creating your barcode
                    </barcode>
                </div>
            </div>
            <div v-show="isBeforeBuy" id="user-cart-nametag-container">
                <p class="user-cart-nametag">상품명</p><div class="vertical-line"></div>
                <p class="user-cart-nametag">상품가격</p><div class="vertical-line"></div>
                <p class="user-cart-nametag">상품개수</p>
            </div>
            <div v-show="isBeforeBuy" id="user-cart-container">
                <div class="user-cart-data" v-for="(cartData, index) in userCartDatas" :key="index">
                    <p class="user-cart">{{ (cartData !== undefined) ? cartData.goodName : "*" }}</p><div class="user-cart-vertical-line"></div>
                    <p class="user-cart">{{ (cartData !== undefined) ? cartData.goodPrice + " 원" : "*" }}</p><div class="user-cart-vertical-line"></div>
                    <p class="user-cart">{{ (cartData !== undefined) ? cartData.goodCount + " 개" : "*" }}</p>
                </div>
            </div>
            <custom-button v-show="!isBeforeBuy" class="check-shop-list-button" @click.native="checkShopListButton" :buttonText="buttonText.checkShopList"></custom-button>
            <p v-show="isBeforeBuy" class="explain-text">구매하기로 마음먹으셨나요?</p>
            <custom-button v-show="isBeforeBuy" class="shopping-list-button" @click.native="buyButton" :buttonText="buttonText.buy"></custom-button>
            <p v-show="isBeforeBuy" class="explain-text">장바구니에 추가로 상품을 담으셨나요?</p>
            <custom-button v-show="isBeforeBuy" class="shopping-list-button" @click.native="initializeButton" :buttonText="buttonText.initialize"></custom-button>
            <p v-show="isBeforeBuy" class="explain-text">구매를 취소하고 로그아웃하시겠어요?</p>
            <custom-button v-show="isBeforeBuy" class="shopping-list-button last-button" @click.native="signOutButton" :buttonText="buttonText.signOut"></custom-button>
        </div>
    </div>
</template>

<script>
import configPayment from '../assets/configs/payment.json'

export default {
    name : 'ShoppingList',
    props : ['userName', 'userId'],
    data : function() {
        return {
            isBeforeBuy : false,
            userCartDatas : [],
            paymentDatas : [],
            goodTotalCount : '',
            goodTotalPrice : '',
            buttonText : {
                signOut : '로그아웃',
                buy : '구매하기',
                checkShopList : '장바구니 조회',
                initialize : '다시 조회하기'
            }
        }
    },
    created() {
        
    },
    methods : {
        signOutButton : function() {
            var isSignOut = confirm('정말 로그아웃 하시겠어요? 먼저 휴대폰의 장바구니 내역이 삭제됩니다 :(');

            if(isSignOut) {
                var usersAccountsSignOutParams = {
                    headers : {
                        token : this.$store.state.user.token
                    }
                };
                this.$axios.post(this.$store.state.host + this.$store.state.urls.usersGoodsDelete, null, usersAccountsSignOutParams)
                .then(res => {
                    if(res.status == 201) {
                        
                        this.$axios.post(this.$store.state.host + this.$store.state.urls.usersAccountsSignOut, null, usersAccountsSignOutParams)
                        .then(res => {
                            if(res.status == 201) {
                                var sessionStorage = window.sessionStorage;
                                sessionStorage.removeItem('userEmail');
                                sessionStorage.removeItem('userName');
                                sessionStorage.removeItem('userToken');
                                sessionStorage.removeItem('userId');
                                
                                this.$store.commit('deleteUser');
                                alert('이어서 로그아웃이 진행됩니다 :) 다음에 또 이용해주세요');

                                this.$router.push({
                                    name : 'Home'
                                });
                            }
                        })
                        .catch(error => {
                            console.log('Server error, please ask to developer');
                            alert('Server error, please ask to developer');
                        });
                    }
                })
                .catch(error => {
                    if(error.response.status == 400 && error.response.data.title == 'Check token fail') {
                        alert('세션이 만료되었어요, 새로고침을 부탁드립니다 :(');
                    } else {
                        console.log('Server error, please ask to developer');
                        alert('Server error, please ask to developer');
                    }
                });
            }
        },
        setCartDataToPayment : function() {
            for(var i = 0; i < this.userCartDatas.length; i++) {
                this.paymentDatas[i] = {};
                this.paymentDatas[i]['item_name'] = this.userCartDatas[i].goodName;
                this.paymentDatas[i]['qty'] = this.userCartDatas[i].goodCount;
                this.paymentDatas[i]['unique'] = this.userCartDatas[i].goodId.toString();
                this.paymentDatas[i]['price'] = this.userCartDatas[i].goodPrice;
                
                if(i == this.userCartDatas.length - 1 || this.userCartDatas[i + 1] === undefined) {
                    return true;
                }
            }
        },
        buyButton : function() {
            var axios = this.$axios;
            var BootPay = this.$BootPay;
            var store = this.$store;
            var moment = this.$moment;
            var goodTotalPrice = this.goodTotalPrice;
            var paymentDatas = this.paymentDatas;

            if(this.setCartDataToPayment()) {
                BootPay.request({
                    price : this.goodTotalPrice,
                    application_id : configPayment.appId,
                    name : 'SmartCart ' + this.userCartDatas[0].goodName + ' 외', 
                    pg : '',
                    method : '',
                    show_agree_window : 0,
                    items : this.paymentDatas,
                    user_info : {
                        username : '이산하',
                        email : 'fantasy_gang@naver.com',
                        addr : '사용자 주소',
                        phone : '010-3035-9489'
                    },
                    order_id : moment(new Date()).format('YYYYMMDDHHMM') + this.userId,
                    params : {totalPrice : this.goodTotalPrice},
                    account_expire_at : '2018-05-25',
                    extra : {
                        start_at : '2019-05-10',
                        end_at : '2022-05-10',
                        vbank_result : 1,
                        quota : '0,2,3'
                    }
                })
                .error(function(data) {
                    console.log(data);
                    console.log('Server error, please ask to developer');
                    alert('Server error, please ask to developer');
                })
                .cancel(function(data) {
                    alert('결제가 취소되었습니다');
                })
                .ready(function(data) {
                    
                })
                .confirm(function(data) {
                    var usersPaymentsDoParameter = {
                        params : {
                            receiptId : data.receipt_id,
                            goodTotalPrice : goodTotalPrice
                        }
                    };

                    axios.get(store.state.host + store.state.urls.usersPaymentsDo, usersPaymentsDoParameter)
                    .then(res => {
                        if(res.status == 200 && res.data.title == 'Do payment has success') {
                            var usersPaymentsApplyParams = {
                                receiptId : data.receipt_id,
                                totalPrice : goodTotalPrice,
                                paymentDatas : paymentDatas
                            };
                            var usersPaymentsApplyheader = {
                                headers : {
                                    token : store.state.user.token
                                }
                            };
        
                            axios.post(store.state.host + store.state.urls.usersPaymentsApply, usersPaymentsApplyParams, usersPaymentsApplyheader)
                            .then(res => {
                                if(res.status == 201) {
                                    BootPay.transactionConfirm(data);
                                }
                            })
                            .catch(error => {
                                BootPay.removePaymentWindow();
                                if(error.response.status == 400 && error.response.data.title == 'Check token fail') {
                                    alert('토큰이 만료되었습니다. 다시 시도해보세요 :)');
                                } else {
                                    console.log('Server error, please ask to developer');
                                    alert('Server error, please ask to developer');
                                }
                            });    
                        }
                    })
                    .catch(error => {
                        BootPay.removePaymentWindow();
                        console.log('Server error, please ask to developer');
                        alert('Server error, please ask to developer');
                    })
                })
                .close(function(data) {
                
                })
                .done(function(data) {
                    alert('결제가 완료되었습니다 :) 감사합니다 고객님!');
                });
                this.isBeforeBuy = false;
                this.userCartDatas = [];
                this.paymentDatas = [];
            }
        },
        checkShopListButton : function() {
            var usersGoodsReadParams = {
                params : {

                },
                headers : {
                    token : this.$store.state.user.token
                }
            };

            this.$axios.get(this.$store.state.host + this.$store.state.urls.usersGoodsRead, usersGoodsReadParams)
            .then(res => {
                if(res.status == 200 && res.data.title == 'No goods') {
                    alert('장바구니에 상품이 존재하지 않습니다');
                } else {
                    this.isBeforeBuy = true;
                    this.userCartDatas = res.data.data.goodDatas;
                    this.goodTotalCount = res.data.data.goodTotalCount;
                    this.goodTotalPrice = res.data.data.goodTotalPrice;
                    this.userCartDatas.length = (this.userCartDatas.length < 24) ? this.userCartDatas.length = 24 : this.userCartDatas.length;
                }
            })
            .catch(error => {
                if(error.response.status == 400 && error.response.data.title == 'Check token fail') {
                        alert('세션이 만료되었어요, 새로고침을 부탁드립니다 :(');
                } else {
                    console.log('Server error, please ask to developer');
                    alert('Server error, please ask to developer');
                }
            });
        },
        initializeButton : function() {
            this.isBeforeBuy = false;
        }
    }
}
</script>

<style lang="scss" scoped>
#shopping-list-container {
    float : left;
    width : 100vw;
    height : auto;
    margin : 5vw 0 5vw 0;
}

#shopping-list-user-data {
    float : left;
    width : 90vw;
    height : 35vw;
    border : 0.5vw solid #3C0269;
    border-radius : 1vw;
    margin : 2.5vw auto 2.5vw 4.5vw;
}

#shopping-list-user-name {
    float : left;
    width : 100%;
    text-align : center;
    margin : 0;
    padding : 0;
}

#shopping-list-total-count {
    float : left;
    width : 272px;
    margin : 14px 0 0 80px;
    padding : 0;
}

#shopping-list-total-price {
    float : left;
    width : 68vw;
    margin : 0 0 0 20vw;
    padding : 0;
}

span {
    font-size : 5.5vw;
    color : #3C0269;
}

#barcode-container {
    float : left;
    margin : 3.5vw auto 0 31.5vw;
}

.vue-barcode-element {
    float : left;
}

rect {
    float : left;
}

.check-shop-list-button {
    float : left;
    margin : 7.5vw auto 7.5vw 32.5vw;
}

.sign-out-button {
    float : left;
}

.buy-button {
    float : left;
}

#user-cart-container {
    float : left;
    width : 90vw;
    height : 125vw;
    border : 0.5vw solid #3C0269;
    border-radius : 1vw;
    margin : 2.5vw auto 7.5vw 4.5vw;
    overflow-y : scroll;
}

#user-cart-nametag-container {
    float : left;
    width : 90vw;
    height : 10vw;
    border : 0.5vw solid #3C0269;
    margin : 7.5vw auto 0 4.5vw;
    border-radius : 1vw;
}

.user-cart-nametag {
    float : left;
    width : 29.5vw;
    margin : 0;
    padding : 0;
    text-align : center;
    font-size : 6vw;
    font-weight : 900;
    color : #3C0269;
}

.vertical-line {
    float : left;
    height : 8vw;
    border : 0.125vw solid #3C0269;
    margin : 1vw 0 0 0;
}

.user-cart {
    float : left;
    width : 29.5vw;
    margin : 0;
    padding : 0;
    text-align : center;
    font-size : 4vw;
    font-weight : 900;
}

.user-cart-vertical-line {
    float : left;
    height : 3.5vw;
    border : 0.125vw solid #3C0269;
    margin : 1.5vw 0 0 0;
}

.explain-text {
    width : 100vw;
    text-align : center;
}

.explain-text {
    float : left;
    width : 100vw;
    text-align : center;
    font-size : 3.5vw;
    color : #585858;
}

.shopping-list-button {
    float : left;
    margin : 0 auto 5vw 32.5vw;
}

.last-button {
    margin-bottom : 12.5vw;
}
</style>