module.exports.tokenCheck = (data, callbackFunction) => {
    if(!isEmpty(data)) callbackFunction('Token is not exist');
    else callbackFunction(null, 'Token is exist');
};

function isEmpty(data) {
    if(data == null || data == '' || data === undefined) return false;

    return true;
};
