const express = require('express');
const router = express.Router();
const async = require('async');

const bootPay = require('../../../private_modules/payment/boot_pay');

router.get('/', (req, res) => {
	let receiptId = req.query.receiptId;
	let goodTotalPrice = req.query.goodTotalPrice;
	
	let doPaymentTask = [
		(callback) => {
			bootPay.getToken(receiptId, parseInt(goodTotalPrice), (getTokenError, getTokenResult) => {
				if(getTokenError) {
					res.status(500).send({
						stat : 'Fail',
						title : 'Get access token from boot-pay has fail',
						contents : getTokenError
					});

					callback(getTokenError);
				} else {
					callback(null, getTokenResult);
				}
			});
		},
		(doPaymentResult, callback) => {
			console.log(doPaymentResult);
			if(doPaymentResult == 'Get payment has success') {
				res.status(200).send({
					stat : 'Success',
					title : 'Do payment has success',
					contents : 'Do payement with Boot pay has success'
				});

				callback(null, 'Do payment has success\nDo payment with Boot pay has success');
			}
		}
	];

	async.waterfall(doPaymentTask, (asyncError, asyncResult) => {
    if(asyncError) console.log('Async fail : Do payment task fail\n' + asyncError);
    else console.log('Async success : Do payment task success\n' + asyncResult);
	});
});

module.exports = router;