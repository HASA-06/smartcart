const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../../private_modules/database/aws_rds');
const mybatis = require('../../../private_modules/database/mybatis');
const tokenValidity = require('../../../private_modules/validity/token');
const jsonWebToken = require('../../../private_modules/json_web_token');

router.get('/', (req, res) => {
	let adminToken = req.headers.token;
	let lastAdminId = req.query.lastAdminId;

  let readAccountTask = [
		(callback) => {
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
					callback(null, connectingRDSResult, adminId);
				}
			});
		},
		(connection, adminId, callback) => {
			if(lastAdminId) {
				let getMoreAdminDataParameter = {
					lastAdminId : lastAdminId
				};
				let getMoreAdminDataQuery = mybatis.mappingSQLStatement('admins/accounts', 'read', 'getMoreAdminData', getMoreAdminDataParameter);

				connection.query(getMoreAdminDataQuery, (getMoreAdminDataQueryError, getMoreAdminDataQueryResult) => {
					connection.release();

					if(getMoreAdminDataQueryError) {
						res.status(500).send({
							stat : 'Fail',
							title : 'Get more admin data query fail',
							contents : getMoreAdminDataQueryError
						});

						callback('Get more admin data query fail\n' + getMoreAdminDataQueryError);
					} else {
						res.status(200).send({
							stat : 'Success',
							title : 'Get more admin data success',
							contents : 'Get more admin data has succeed, please check \'data\' part',
							data : getMoreAdminDataQueryResult
						});

						callback(null, 'Read more admin data has success');
					}
				});
			} else {
				let getAllAdminDataParameter = null;
				let getAllAdminDataQuery = mybatis.mappingSQLStatement('admins/accounts', 'read', 'getAllAdminData', getAllAdminDataParameter);

				connection.query(getAllAdminDataQuery, (getAllAdminDataQueryError, getAllAdminDataQueryResult) => {
					connection.release();

					if(getAllAdminDataQueryError) {
						res.status(500).send({
							stat : 'Fail',
							title : 'Get all admin data query fail',
							contents : getAllAdminDataQueryError
						});

						callback('Get all admin data query fail\n' + getAllAdminDataQueryError);
					} else {
						res.status(200).send({
							stat : 'Success',
							title : 'Get all admin data success',
							contents : 'Get all admin data has succeed, please check \'data\' part',
							data : getAllAdminDataQueryResult
						});

						callback(null, 'Read all admin data has success');
					}
				});
			}
		}
	];

	async.waterfall(readAccountTask, (asyncError, asyncResult) => {
		if (asyncError) console.log('Async fail : Read account fail\n' + asyncError);
		else console.log('Async success : Read account success\n' + asyncResult);
	});
});

module.exports = router;