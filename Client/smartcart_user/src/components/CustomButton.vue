<template>
    <div class="custom-button">
        <div class="custom-button-container">
            <p class="custom-button-text">
                {{ buttonText }}
            </p>
        </div>
    </div>
</template>

<script>
export default {
    name : 'CustomButton',
    props : ['buttonText']
}
</script>

<style lang="scss" scoped>
.custom-button-container {
    float : left;
    width : 35vw;
    height : 10vw;
    background-color : #3C0269;
    border-radius : 1vw;
}

.custom-button-container:hover {
    cursor : pointer;
    background-color : #2D024F
}

.custom-button-container:active {
    cursor : pointer;
    background-color : #2D024F
}

.custom-button-text {
    width : 35vw;
    color : #FFFFFF;
    text-align : center;
    margin : 0.75vw 0 0 0;
    float : left;
    padding : 0;
    font-size : 5vw;
    font-weight : 900;
}

@media ( min-width : 768px ) {

}

@media ( min-width : 1024px ) {
    
}
</style>