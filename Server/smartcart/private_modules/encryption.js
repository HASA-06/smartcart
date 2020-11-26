const crypto = require('crypto');

module.exports = function(data, salt, callbackFunction) {
    if(salt == 'empty') {
        crypto.randomBytes(100, (saltingError, saltingResult) => {
            if(saltingError) {
                callbackFunction(saltingError)
            } else {
                crypto.pbkdf2(data, saltingResult.toString('hex'), 93124, 80, 'SHA512', (hashingError, hashingResult) => {
                    if(hashingError) {
                        callbackFunction(hashingError, null, null);
                    } else {
                        callbackFunction(null, saltingResult.toString('hex'), hashingResult.toString('hex'));
                    }
                });
            }
        });
    } else {
        crypto.pbkdf2(data, salt, 93124, 80, 'SHA512', (hashingError, hashingResult) => {
            if(hashingError) {
                callbackFunction(hashingError, null, null);
            } else {
                callbackFunction(null, salt, hashingResult.toString('hex'));
            }
        })
    }
}