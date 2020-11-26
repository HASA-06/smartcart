const express = require('express');
const router = express.Router();
const async = require('async');

const jsonWebToken = require('../../../private_modules/json_web_token');
const validity = require('../../../private_modules/validity/token');
const awsRDS = require('../../../private_modules/database/aws_rds');
const mybatis = require('../../../private_modules/database/mybatis');

router.get('/', (req, res) => {
    res.status(200).send({
        stat: 'Success',
        msg: 'URL /admins/tokens/check is connected'
    });
});

router.post('/', (req, res) => {
    let adminToken = req.headers.token;

    let checkTask = [
        (callback) => {
            validity.tokenCheck(adminToken, (tokenCheckError, tokenCheckResult) => {
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
            jsonWebToken.checkToken(adminToken, (checkTokenError, checkTokenResult) => {
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
            let getAdminTokenParameter = {
                id : checkTokenResult.id,
                adminJWTToken : adminToken
            };
            let getAdminTokenQuery = mybatis.mappingSQLStatement('admins/tokens', 'check', 'getAdminToken', getAdminTokenParameter);

            connection.query(getAdminTokenQuery, (getAdminTokenQueryError, getAdminTokenQueryResult) => {
                connection.release();
                
                if(getAdminTokenQueryError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Check token query fail',
                        contents : getAdminTokenQueryError
                    });

                    callback('Check token query fail\n' + getAdminTokenQueryError);
                } else if(getAdminTokenQueryResult.length == 1) {
                    res.status(201).send({
                        stat : 'Success',
                        title : 'Check token success',
                        contents : 'This token is effective',
                    });

                    callback(null, 'Check token success\nThis token is effective');
                } else {
                    res.status(400).send({
                        stat : 'Fail',
                        title : 'No admin with this token',
                        contents : 'Please check admin token'
                    });

                    callback('No admin with this token\nPlease check admin token');
                }
            });
        }
    ];

    async.waterfall(checkTask, (asyncError, asyncResult) => {
        if(asyncError) console.log('Async fail : Admin token check fail\n' + asyncError);
        else console.log('Async Success : Admin token check success\n' + asyncResult);
    });
});

module.exports = router;