const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../../private_modules/database/aws_rds');
const tokenValidity = require('../../../private_modules/validity/token');
const paymentValidity = require('../../../private_modules/validity/payment');
const mybatis = require('../../../private_modules/database/mybatis');
const jsonWebToken = require('../../../private_modules/json_web_token');

router.get('/', (req, res) => {
	res.status(200).send({
      stat : "Success",
      msg : "URL /users/payments/apply is connected"
  });
});

router.post('/', (req, res) => {
	let userToken = req.headers.token;
	let receiptId = req.body.receiptId;
	let totalPrice = req.body.totalPrice
	let paymentDatas = req.body.paymentDatas;
	
	paymentApplyTask = [
		(callback) => {
			tokenValidity.tokenCheck(userToken, (tokenCheckError, tokenCheckResult) => {
        if(tokenCheckError) {
          res.status(400).send({
            stat : 'Fail',
            title : 'Token check fail',
            contents : tokenCheckError
          });

          callback('Token check fail\n' + tokenCheckError);
        } else {
          callback(null, tokenCheckResult);
        }
      });
    },
    (tokenCheckResult, callback) => {
      jsonWebToken.checkToken(userToken, (checkTokenError, checkTokenResult) => {
        if(checkTokenError) {
          res.status(400).send({
            stat : 'Fail',
            title : 'Check token fail',
            contents : checkTokenError
          });

          callback('Check token fail\n' + checkTokenError);
        } else {
          callback(null, checkTokenResult.id);
        }
      });
    },
    (userId, callback) => {
    	paymentValidity.check(receiptId, totalPrice, paymentDatas, (paymentValidityCheckError, paymentValidityCheckResult) => {
    		if(paymentValidityCheckError) {
    			res.status(400).send({
    				stat : 'Fail',
    				title : 'Payment validity check fail',
    				contents : paymentValidityCheckError
    			});

    			callback('Payment validity check fail\n' + paymentValidityCheckError);
    		} else {
    			callback(null, userId);
    		}
    	});
    },
    (userId, callback) => {
    	awsRDS.getConnection((connectingRDSError, connectingRDSResult) => {
        if(connectingRDSError) {
          res.status(500).send({
              stat : 'Fail',
              title : 'Connecting RDS fail',
              contents : connectingRDSError
          });

          callback('Connecting RDS fail\n' + connectingRDSError);
        } else {
          callback(null, connectingRDSResult, userId);
        }
	    });
    },
    (connection, userId, callback) => {
    	connection.beginTransaction(beginTransactionError => {
	      if(beginTransactionError) {
	          connection.release();

	          res.status(500).send({
	              stat : 'Fail',
	              title : 'Begin transaction fail',
	              contents : beginTransactionError
	          });

	          callback('Begin transaction fail\n' + beginTransactionError);
	      } else {
	      	let setPaymentsDatasParameter = {
	      		userId : userId,
	      		receiptId : receiptId,
	      		totalPrice : totalPrice
	      	};
	      	let setPaymentsDatasQuery = mybatis.mappingSQLStatement('users/payments', 'apply', 'setPaymentsDatas', setPaymentsDatasParameter);

	      	connection.query(setPaymentsDatasQuery, (setPaymentsDatasQueryError, setPaymentsDatasQueryResult) => {
	      		if(setPaymentsDatasQueryError) {
	      			connection.rollback();
	      			connection.release();

	      			res.status(500).send({
	      				stat : 'Fail',
	      				title : 'Set payments datas query fail',
	      				contents : setPaymentsDatasQueryError
	      			});

	      			callback('Set payments datas query fail\n' + setPaymentsDatasQueryError);
	      		} else {
	      			callback(null, connection, userId);
	      		}
	      	});
	      }
	    });
    },
    (connection, userId, callback) => {
    	let getLastPaymentDatasIdQuery = mybatis.mappingSQLStatement('users/payments', 'apply', 'getLastPaymentDatasId', null);

    	connection.query(getLastPaymentDatasIdQuery, (getLastPaymentDatasIdQueryError, getLastPaymentDatasIdQueryResult) => {
    		if(getLastPaymentDatasIdQueryError) {
    			connection.rollback();
    			conection.release();

    			res.status(500).send({
    				stat : 'Fail',
    				title : 'Get last payments datas id query fail',
    				contents : getLastPaymentDatasIdQueryError
    			});

    			callback('Get las payments datas id query fail\n' + getLastPaymentDatasIdQueryError);
    		} else {
    			console.log(getLastPaymentDatasIdQueryResult[0]['LAST_INSERT_ID()']);
    			callback(null, connection, userId, getLastPaymentDatasIdQueryResult[0]['LAST_INSERT_ID()']);
    		}
    	})
    },
    (connection, userId, paymentId, callback) => {
    	for(var i = 0; i < paymentDatas.length; i++) {
        paymentDatas[i]['goodId'] = paymentDatas[i]['unique'];
        paymentDatas[i]['goodCount'] = parseInt(paymentDatas[i]['qty']);
        delete paymentDatas[i]['item_name'];
        delete paymentDatas[i]['qty'];
        delete paymentDatas[i]['unique'];
        delete paymentDatas[i]['price'];
        console.log(paymentDatas[i]);
        if(i == paymentDatas.length - 1) {
           let setPaymentsDetailDatasParameter = {
		    		paymentId : paymentId,
		    		goodDatas : paymentDatas
		    	};
		    	let setPaymentsDetailDatasQuery = mybatis.mappingSQLStatement('users/payments', 'apply', 'setPaymentsDetailDatas', setPaymentsDetailDatasParameter);

		    	connection.query(setPaymentsDetailDatasQuery, (setPaymentsDetailDatasQueryError, setPaymentsDetailDatasQueryResult) => {
		    		if(setPaymentsDetailDatasQueryError) {
		    			connection.rollback();
		    			connection.release();

		    			res.status(500).send({
		    				stat : 'Fail',
		    				title : 'Set payments detail datas query fail',
		    				contents : setPaymentsDetailDatasQueryError
		    			});

		    			callback('Set payments detail datas query fail\n' + setPaymentsDetailDatasQueryError);
		    		} else {
		    			callback(null, connection, userId, paymentId, paymentDatas);
		    		}
		    	});
        }
      }
    },
    (connection, userId, paymentId, paymentDatas, callback) => {
    	let setGoodCountForPaymentParameter = {
    		goodDatas : paymentDatas
    	}
    	let setGoodCountForPaymentQuery = mybatis.mappingSQLStatement('users/payments', 'apply', 'setGoodCountForPayment', setGoodCountForPaymentParameter);

    	connection.query(setGoodCountForPaymentQuery, (setGoodCountForPaymentQueryError, setGoodCountForPaymentQueryResult) => {
    		if(setGoodCountForPaymentQueryError) {
    			connection.rollback();
    			connection.release();

    			res.status(500).send({
    				stat : 'Fail',
    				title : 'Set good count for payment query fail',
    				contents : setGoodCountForPaymentQueryError
    			});

    			callback('Set good count for payment query fail\n' + setGoodCountForPaymentQueryError);
    		} else {
    			callback(null, connection, userId, paymentId, paymentDatas);
    		}
    	});
    },
    (connection, userId, paymentId, paymentDatas, callback) => {
    	let deleteUserCartDataParameter = {
    		userId : userId
    	};
    	let deleteUserCartDataQuery = mybatis.mappingSQLStatement('users/payments', 'apply', 'deleteUserCartData', deleteUserCartDataParameter);

    	connection.query(deleteUserCartDataQuery, (deleteUserCartDataQueryError, deleteUserCartDataQueryResult) => {
    		if(deleteUserCartDataQueryError) {
    			connection.rollback();
    			connection.release();

    			res.status(500).send({
    				stat : 'Fail',
    				title : 'Delete user cart data query fail',
    				contents : deleteUserCartDataQueryError
    			});

    			callback('Delete user cart data query fail\n' + deleteUserCartDataQueryError);
    		} else {
    			connection.commit();
    			connection.release();

    			res.status(201).send({
    				stat : 'Success',
    				title : 'Payment apply task has success',
    				contents : 'User\'s payment data has saved'
    			});

    			callback(null, 'Payment apply task has success\nUser\'s payment data has saved');
    		}
    	});
    }
	];

	async.waterfall(paymentApplyTask, (asyncError, asyncResult) => {
		if(asyncError) console.log('Async fail : Apply payment task fail\n' + asyncError);
    else console.log('Async success : Apply payment task success\n' + asyncResult);
	})
});

module.exports = router;