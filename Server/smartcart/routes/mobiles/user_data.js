const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../private_modules/database/aws_rds');
const mybatis = require('../../private_modules/database/mybatis');
const mobileValidity = require('../../private_modules/validity/mobile');

router.get('/', (req, res) => {
	let userId = req.query.userId;

	let getUserDataTask = [
		(callback) => {
			if(mobileValidity.isEmpty(userId)) {
				awsRDS.getConnection((connectingRDSError, connectingRDSResult) => {
	        if(connectingRDSError) {
	          res.status(500).send({
	              stat : 'Fail',
	              title : 'Connecting RDS fail',
	              contents : connectingRDSError
	          });

	          callback('Connecting RDS fail\n' + connectingRDSError);
	        } else {
	          callback(null, connectingRDSResult);
	        }
	    	});
			} else {
				callback('Mobile validity for user id has error\nNo user');
			}
		},
		(connection, callback) => {
			let getUserDataByIdParameter = {
				userId : userId
			};
			let getUserDataByIdQuery = mybatis.mappingSQLStatement('mobiles', 'user_data', 'getUserDataById', getUserDataByIdParameter);

			connection.query(getUserDataByIdQuery, (getUserDataByIdQueryError, getUserDataByIdQueryResult) => {
				connection.release();

				if(getUserDataByIdQueryError) {
					res.status(500).send({
						stat : 'Fail',
						title : 'Get user data by id query fail',
						contents : getUserDataByIdQueryError
					});
				} else {
					res.status(200).send({
						stat : 'Success',
						title : 'Get user data by id query success',
						contents : 'Get user data task success',
						data : getUserDataByIdQueryResult[0]
					});
				}
			});
		}
	];

	async.waterfall(getUserDataTask, (asyncError, asyncResult) => {
		if(asyncError) console.log('Async fail : Get user data task fail\n' + asyncError);
    else console.log('Async success : Get user data task success\n' + asyncResult);
  });
});

module.exports = router;