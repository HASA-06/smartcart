const jsonWebToken = require('jsonwebtoken');
const jsonWebTokenConfig = require('../configs/json_web_token.json');

module.exports.createToken = (id, callbackFunction) => {
    var payload = {
        id: id
    };
    var option = {
        subject: jsonWebTokenConfig.subject,
        issuer: jsonWebTokenConfig.issuer,
        algorithm: jsonWebTokenConfig.algorithm,
        expiresIn: jsonWebTokenConfig.expiresIn
    };

    jsonWebToken.sign(payload, jsonWebTokenConfig.secretKey.toString('base64'), option, (jsonWebTokenSignError, jsonWebTokenSignResult) => {
        if(jsonWebTokenSignError) {
            callbackFunction(jsonWebTokenSignError);
        } else {
            callbackFunction(null, jsonWebTokenSignResult);
        }
    });
}

module.exports.checkToken = function(token, callbackFunction) {
    jsonWebToken.verify(token, jsonWebTokenConfig.secretKey.toString('base64'), (jsonWebTokenVerifyError, jsonWebTokenVerifyResult) => {
        if(jsonWebTokenVerifyError) {
            callbackFunction(jsonWebTokenVerifyError);
        } else {
            callbackFunction(null, jsonWebTokenVerifyResult);
        }
    });
}