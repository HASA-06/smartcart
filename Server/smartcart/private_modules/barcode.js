const barcodeTypes = {
    kan8 : 'KAN-8',
    kan13 : 'KAN-13',
    other : 'OTHER'
};

module.exports.sortBarcode = (barcodeNumber, callbackFunction) => {
    var barcodeType = getBarcodeType(barcodeNumber);

    if(barcodeType == barcodeTypes.kan8) {
        callbackFunction(barcodeKAN8(barcodeNumber));
    } else if(barcodeType == barcodeTypes.kan13) {
        callbackFunction(barcodeKAN13(barcodeNumber));
    } else if(barcodeType == barcodeTypes.other) {

    } else {

    }
}

function barcodeKAN8(barcodeNumber, callbackFunction) {
    return {
        nationCode : barcodeNumber.slice(0, 3),
        companyCode : barcodeNumber.slice(3, 6),
        goodCode : barcodeNumber.slice(6, 7),
        checkDigit : barcodeNumber.slice(7, 8)
    };
}

function barcodeKAN13(barcodeNumber) {
    var detailBarcodeType = barcodeNumber.slice(4, 5);
    var companyCodeLenght;
   
    switch (detailBarcodeType) {
        case '6' : 
        companyCodeLength = 5;
        break;
    case '9' : 
        companyCodeLength = 6;
        break;
    default :
        companyCodeLength = 4;
    }
    
    return {
        nationCode : barcodeNumber.slice(0, 4),
        companyCode : barcodeNumber.slice(4, companyCodeLength + 4),
        goodCode : barcodeNumber.slice(companyCodeLength + 4, 12),
        checkDigit : barcodeNumber.slice(12, 13)
    };
}

function getBarcodeType(barcodeNumber) {
    if(barcodeNumber.length == 8) {
        return barcodeTypes.kan8;
    } else if(barcodeNumber.length == 13) {
        return barcodeTypes.kan13;
    } else {
        return barcodeTypes.other;
    }
}