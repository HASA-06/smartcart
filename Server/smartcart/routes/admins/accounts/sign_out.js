const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../../private_modules/database/aws_rds');
const accountValidity = require('../../../private_modules/validity/token');
const mybatis = require('../../../private_modules/database/mybatis')
const jsonWebToken = require('../../../private_modules/json_web_token');

router.get('/', (req, res) => {
    res.status(200).send({
        stat : 'Success',
        msg : 'URL /admins/accounts/sign-out is connected'
    });
});

router.post('/', (req, res) => {
    let adminToken = req.headers.token;

    let signOutTask = [
        (callback) => {
            accountValidity.tokenCheck(adminToken, (tokenCheckError, tokenCheckResult) => {
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
                    callback(null, checkTokenResult.id)
                }
            })
        },
        (adminId, callback) => {
            awsRDS.getConnection((connectingRDSError, connectingRDSResult) => {
                if(connectingRDSError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Connecting RDS fail',
                        contents : connectingRDSError
                    });

                    callback('Connecting RDS fail\n'+ connectingRDSError);
                } else {
                    callback(null, connectingRDSResult, adminId);
                }
            });
        },
        (connection, adminId, callback) => {
            let getAdminTokenParameter = {
                id : adminId,
                adminJWTToken : adminToken
            };
            let getAdminTokenQuery = mybatis.mappingSQLStatement('admins/accounts', 'sign_out', 'getAdminToken', getAdminTokenParameter);

            connection.query(getAdminTokenQuery, (getAdminTokenQueryError, getAdminTokenQueryResult) => {
                if(getAdminTokenQueryError) {
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Get admin token query fail',
                        contents: getAdminTokenQueryError
                    });

                    callback('Get admin token query fail\n' + getAdminTokenQueryError);
                } else if(getAdminTokenQueryResult.length == 1) {
                    callback(null, connection, adminId);
                } else {
                    connection.release();

                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Get admin token query fail',
                        contents : 'No admin with the id and token'
                    });

                    callback('Get admin token query fail\nNo admin with the id and token');
                }
            });
        },
        (connection, adminId, callback) => {
            let setAdminTokenParameter = {
                id : adminId
            };
            let setAdminTokenQuery = mybatis.mappingSQLStatement('admins/accounts', 'sign_out', 'setAdminToken', setAdminTokenParameter);

            connection.query(setAdminTokenQuery, (setAdminTokenQueryError, setAdminTokenQueryResult) => {
                connection.release();
                
                if(setAdminTokenQueryError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Set admin token query fail',
                        contents : setAdminTokenQueryError
                    });

                    callback('Set admin token query fail\n' + setAdminTokenQueryError);
                } else if(setAdminTokenQueryResult.affectedRows == 1) {
                    res.status(201).send({
                        stat : 'Success',
                        title : 'Sign out success',
                        contents : 'Bye, see you later'
                    });

                    callback(null, 'Sign out success\nBye, see you later');
                } else {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Unsuspected fail',
                        content: 'Please ask to server admin'
                    });

                    callback('Unsuspected fail\nPlease ask to server admin');
                }
            });
        }
    ];

    async.waterfall(signOutTask, (asyncError, asyncResult) => {
        if(asyncError) console.log('Async Fail : Sign-out error\n' + asyncError);
        else console.log('Async Success : Sign-out success\n' + asyncResult);
    });
});

module.exports = router;