const express = require('express');
const router = express.Router();
const async = require('async');

const jsonWebToken = require('../../../private_modules/json_web_token');
const tokenValidity = require('../../../private_modules/validity/token');
const awsRDS = require('../../../private_modules/database/aws_rds');
const mybatis = require('../../../private_modules/database/mybatis');

router.get('/', (req, res) => {
    res.status(200).send({
        stat: 'Success',
        msg: 'URL /user/tokens/check is connected'
    });
});

router.post('/', (req, res) => {
    let userToken = req.headers.token;

    let checkTask = [
        (callback) => {
            tokenValidity.tokenCheck(userToken, (tokenCheckError, tokenCheckResult) => {
                if(tokenCheckError) {
                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Token is not exist',
                        contents: tokenCheckError
                    });

                    callback('Token is not exist\n'+ tokenCheckError);
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

                    callback('Check token fail\n'+ checkTokenError);
                } else {
                    callback(null, checkTokenResult);
                }
            })
        },
        (checkTokenResult, callback) => {
            awsRDS.getConnection((connectingRDSError, connectingRDSResult) => {
                if(connectingRDSError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Connecting RDS fail',
                        contents : connectingRDSError
                    });

                    callback('Connecting RDS fail\n' + connectingRDSError);
                } else {
                    callback(null, connectingRDSResult, checkTokenResult);
                }
            });
        },
        (connection, checkTokenResult, callback) => {
            let getUserTokenParameter = {
                id : checkTokenResult.id,
                userJWTToken : userToken
            };
            let getUserTokenQuery = mybatis.mappingSQLStatement('users/tokens', 'check', 'getUserToken', getUserTokenParameter);

            connection.query(getUserTokenQuery, (getUserTokenQueryError, getUserTokenQueryResult) => {
                connection.release();
                
                if(getUserTokenQueryError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Check token query fail',
                        contents : getUserTokenQueryError
                    });

                    callback('Check token query fail\n' + getUserTokenQueryError);
                } else if(getUserTokenQueryResult.length == 1) {
                    res.status(201).send({
                        stat : 'Success',
                        title : 'Check token success',
                        contents : 'This token is effective',
                    });

                    callback(null, 'Check token success\nThis token is effective');
                } else {
                    res.status(400).send({
                        stat : 'Fail',
                        title : 'No user with this token',
                        contents : 'Please check user token'
                    });

                    callback('No user with this token\nPlease check user token');
                }
            });
        }
    ];

    async.waterfall(checkTask, (asyncError, asyncResult) => {
        if(asyncError) console.log('Async fail : User token check fail\n' + asyncError);
        else console.log('Async Success : User token check success\n' + asyncResult);
    });
});

module.exports = router;