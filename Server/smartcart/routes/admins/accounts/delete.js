const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../../private_modules/database/aws_rds');
const mybatis = require('../../../private_modules/database/mybatis');
const tokenValidity = require('../../../private_modules/validity/token');
const jsonWebToken = require('../../../private_modules/json_web_token');

router.get('/', (req, res) => {
	res.status(200).send({
    stat : "Success",
    msg : "URL /admins/accounts/delete is connected"
  });
});

router.post('/', (req, res) => {
	let adminToken = req.headers.token;
	let adminId = req.body.adminId;

	let deleteAccountTask = [
		(callback) => {
			if(adminId) {
				tokenValidity.tokenCheck(adminToken, (tokenCheckError, tokenCheckResult) => {
					if (tokenCheckError) {
						res.status(400).send({
							stat: 'Fail',
							title: 'Token check fail',
							contents: tokenCheckError
						});

						callback('Token check fail\n' + tokenCheckError);
					} else {
						callback(null, tokenCheckResult);
					}
				});
			} else {
				res.status(400).send({
					stat : 'Fail',
					title : 'Not enough input',
					contents : 'No admin id in request'
				});

				callback('Not enough input\nNo admin id in request');
			}
		},
		(tokenCheckResult, callback) => {
			jsonWebToken.checkToken(adminToken, (checkTokenError, checkTokenResult) => {
				if (checkTokenError) {
					res.status(400).send({
						stat: 'Fail',
						title: 'Check token fail',
						contents: checkTokenError
					});

					callback('Check token fail\n' + checkTokenError);
				} else {
					callback(null, checkTokenResult.id);
				}
			});
		},
		(adminId, callback) => {
			awsRDS.getConnection((connectingRDSError, connectingRDSResult) => {
				if (connectingRDSError) {
					res.status(500).send({
					stat: 'Fail',
					title: 'Connecting RDS fail',
					contents: connectingRDSError
				});

					callback('Connecting RDS fail\n' + connectingRDSError);
				} else {
					callback(null, connectingRDSResult);
				}
			});
		},
		(connection, callback) => {
			let deleteAdminDataParameter = {
				adminId : adminId
			};
			let deleteAdminDataQuery = mybatis.mappingSQLStatement('admins/accounts', 'delete', 'deleteAdminData', deleteAdminDataParameter);

			connection.query(deleteAdminDataQuery, (deleteAdminDataQueryError, deleteAdminDataQueryResult) => {
				connection.release();

				if(deleteAdminDataQueryError) {
					res.status(500).send({
						stat : 'Fail',
						title : 'Delete admin data query fail',
						contents : deleteAdminDataQueryError
					});

					callback('Delete admin data query fail\n' + deleteAdminDataQueryError);
				} else {
					res.status(201).send({
						stat : 'Success',
						title : 'Delete admin data success',
						contents : 'Delete admin account task has succeed'
					});

					callback(null, 'Delete admin data success\nDelete admin account task has succeed');
				}
			});
		}
	];

	async.waterfall(deleteAccountTask, (asyncError, asyncResult) => {
		if (asyncError) console.log('Async fail : Delete account fail\n' + asyncError);
		else console.log('Async success : Delete account success\n' + asyncResult);
	});
});

module.exports = router;