module.exports.goodCheck = (datas, callbackFunction) => {
    var datasCount = datas.count;
    var datasKeys = datas.keys;

    for(var indexOfData = 0; indexOfData < datasCount; indexOfData++) {
        if(!isEmpty(datas[datasKeys[indexOfData]])) {
            callbackFunction('Not enough input');
            break;
        } 
        
        if(indexOfData == datasCount - 1) {
            if (!barcodeNumberCheck(datas.barcodeNumber)) {
                callbackFunction('It\'s not barcode, please check again');
            } else {
                callbackFunction(null, 'Validity check success');
            }
        }
    }
};

module.exports.emptyCheck = (datas, callbackFunction) => {
    var datasCount = datas.count;
    var datasKeys = datas.keys;

    for(var indexOfData = 0; indexOfData < datasCount; indexOfData++) {
        if(!isEmpty(datas[datasKeys[indexOfData]])) {
            callbackFunction('Not enough input');
            break;
        } 

        if(indexOfData == datasCount - 1) {
            callbackFunction(null, 'Validity check success');
        }
    }
}

module.exports.goodIdCheck = (data, callbackFunction) => {
    if(!isEmpty(data)) {
        callbackFunction('Not enough input');
    } else {
        callbackFunction(null, 'Good id validity check success');
    }
}

module.exports.goodUpdateCheck = (datas, callbackFunction) => {
    var datasCount = datas.count;
    var datasKeys = datas.keys;

    for(var indexOfData = 0; indexOfData < datasCount; indexOfData++) {
        if(!isEmpty(datas[datasKeys[indexOfData]])) {
            callbackFunction('Not enough input');
            break;
        }

        if(indexOfData == datasCount - 1) {
            callbackFunction(null, 'Good update validity check success');
        }
    }
};

module.exports.goodBarcodeCheck = (data, callbackFunction) => {
    if(!isEmpty(data)) callbackFunction('Not enough input');
    else if(!barcodeNumberCheck(data)) callbackFunction('It\'s not barcode, please check again');
    else callbackFunction(null, 'Validity check success');
}

module.exports.barcodeIdCheck = (data, callbackFunction) => {
    if(!isEmpty(data)) {
        callbackFunction('Not enough input');
    } else {
        callbackFunction(null, 'Good id validity check success');
    }
}

function isEmpty(data) {
    if(data == null || data === '' || data === undefined) return false;

    return true;
};

function barcodeNumberCheck(barcodeNumber) {
    if(barcodeNumber.length == 8 || barcodeNumber.length == 13) return true;
    
    return false;
};