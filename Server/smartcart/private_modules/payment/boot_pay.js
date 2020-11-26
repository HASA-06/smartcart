const bootPayConfig = require('../../configs/payment/boot_pay.json');
const bootPayRest = require('bootpay-rest-client');

module.exports.getToken = function(receiptId, goodTotalPrice, callbackFunction) {
	bootPayRest.setConfig(bootPayConfig.AppID, bootPayConfig.PrivateKey);
	bootPayRest.getAccessToken()
	.then(function(response) {
		if(response.status === 200 && response.data.token !== undefined) {
			bootPayRest.verify(receiptId)
			.then(_response => {
				if(_response.status === 200 && _response.data.price === goodTotalPrice && _response.data.status === 2) {
					callbackFunction(null, 'Get payment has success');
				} else {
					callbackFunction('Get payment has fail');
				}
			})
		} else {
			callbackFunction('Get boot-pay access-token fail');
		}
	});
};