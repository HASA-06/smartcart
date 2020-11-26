module.exports.signUpCheck = (datas, callbackFunction) => {
    var datasCount = datas.count;
    var datasKeys = datas.keys;

    for(var indexOfData = 0; indexOfData < datasCount; indexOfData++) {
        if(!isEmpty(datas[datasKeys[indexOfData]])) {
            callbackFunction('Not enough input');
            break;
        }

        if(indexOfData == datasCount - 1) {
            if(!emailCheck(datas.email)) {
                callbackFunction('Please check email');
            } else if(!passwordCheck(datas.password, datas.passwordAccept)) {
                callbackFunction('Please check password');
            } else if(!phoneNumberCheck(datas.phoneNumber)) {
                callbackFunction('Please check phonenumber');
            } else {
                callbackFunction(null, 'Validity check success');
            }
        }
    }
};

module.exports.signInCheck = (datas, callbackFunction) => {
    var datasCount = datas.count;
    var datasKeys = datas.keys;

    for(var indexOfData = 0; indexOfData < datasCount; indexOfData++) {
        if(!isEmpty(datas[datasKeys[indexOfData]])) {
            callbackFunction('Not enough input');
            break;
        }

        if(indexOfData == datasCount - 1) {
            if(!emailCheck(datas.email)) {
                callbackFunction('Please check email');
            } else if(!passwordCheck(datas.password)) {
                callbackFunction('Please check password');
            } else {
                callbackFunction(null, 'Validity check success');
            }
        }
    }
};

module.exports.registCheck = (datas, callbackFunction) => {
    var datasCount = datas.count;
    var datasKeys = datas.keys;

    for(var indexOfData = 0; indexOfData < datasCount; indexOfData++) {
        if(!isEmpty(datas[datasKeys[indexOfData]])) {
            callbackFunction('Not enough input');
            break;
        }

        if(indexOfData == datasCount - 1) {
            if(!emailCheck(datas.email)) {
                callbackFunction('Please check email');
            } else if(!passwordCheck(datas.password, datas.passwordAccept)) {
                callbackFunction('Please check password');
            } else {
                callbackFunction(null, 'Validity check success');
            }
        }
    }
};

function isEmpty(data) {
    if(data == null || data == '' || data === undefined) return false;

    return true;
}

function emailCheck(email) {
    var regularExpression = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;

    if(!regularExpression.test(email)) return false;
    else return true;
};

function passwordCheck(password, passwordAccept) {
    if(password.length < 6) return false;
    else if((passwordAccept !== undefined) && (password != passwordAccept)) return false;
    else return true;
};

function phoneNumberCheck(phoneNumber) {
    var regularExpression = /^[0-9]+$/;

    if(!regularExpression.test(phoneNumber)) return false;
    else if(phoneNumber.length < 10) return false;
    else if(phoneNumber.length > 11) return false;
    else return true;
};
