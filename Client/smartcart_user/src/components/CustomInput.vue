<template>
    <div class="custom-input">
        <div class="custom-input-container">
            <p class="custom-input-box-label" v-show="!isError">{{ inputLabel }}</p><input class="custom-input-box" v-show="!isError" :type="inputType" v-model.lazy="inputValue"/>
            <p class="custom-input-box-label error" v-show="isError">{{ inputLabel }}</p><input class="custom-input-box error" v-show="isError" :type="inputType" v-model.lazy="inputValue"/>
            <p class="custom-input-box-text" v-show="!isError">{{ explainText }}</p>
            <p class="custom-input-box-text error" v-show="isError">{{ errorText }}</p>
        </div>
    </div>
</template>

<script>
export default {
    name : 'CustomInput',
    props : ['inputType', 'inputLabel', 'explainText', 'errorText', 'isError'],
    data : function() {
        return {
            inputValue : ''
        }
    },
    methods : {
        inputValueEventBus : function() {
            this.$emit('createWait', this.inputValue);
        }
    },
    watch : {
        inputValue : function(val) {
            this.inputValueEventBus();
        }
    }
}
</script>

<style lang="scss" scoped>
.custom-input-container {
    float : left;
    width : 90vw;
    height : auto;
    margin : 2.5vw 5vw 0 5vw;
}

.custom-input-box-label {
    float : left;
    margin : 2vw 0 2vw 9.5vw;
    padding : 0;
    font-size : 4vw;
}

.custom-input-box {
    float : left;
    width : 65.5vw;
    height : 9vw;
    margin : 0 0 0 9vw;
    border-radius : 1vw;
    font-size : 4vw;
    padding-left : 2.5vw;
    border : 0.5vw solid #3C0269;
}

.custom-input-box:hover {
    font-size : 4.5vw;
}

.custom-input-box:active {
    font-size : 4.5vw;
}

.custom-input-box:focus {
    outline : none;
}

.custom-input-box-text {
    float : left;
    width : 71vw;
    height : auto;
    margin : 1.5vw 0 0 9.5vw;
    padding : 0;
    color : #585858;
    font-size : 3vw;
}

.error {
    color : #FE2E2E;
}

.custom-input-box.error {
    border : 0.5vw solid #FE2E2E;
}

@media ( min-width : 768px ) {

}

@media ( min-width : 1024px ) {
    
}

</style>