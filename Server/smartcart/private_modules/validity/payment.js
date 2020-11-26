module.exports.check = function(receiptId, totalPrice, paymentDatas, callbackFunction) {
	if(!isEmpty(receiptId)) {
		callbackFunction('No receipt id in request');
	} else if(!isEmpty(totalPrice)) {
		callbackFunction('No total price in request');
	} else {
		for(var i = 0; i < paymentDatas.length; i++) {
			if(!isEmpty(paymentDatas[i])) {
				callbackFunction('No absolute payments data in request');
				break;
			}

			if(i == paymentDatas.length - 1) {
				callbackFunction(null, 'Validity check has success');
			}
		}
	}
}

function isEmpty(data) {
	if(data == '' || data == null || data == 'null' || data === undefined) return false;
	return true;
}