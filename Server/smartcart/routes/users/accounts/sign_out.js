const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../../private_modules/database/aws_rds');
const tokenValidity = require('../../../private_modules/validity/token');
const mybatis = require('../../../private_modules/database/mybatis')
const jsonWebToken = require('../../../private_modules/json_web_token');

router.get('/', (req, res) => {
    res.status(200).send({
        stat : 'Success',
        msg : 'URL /users/accounts/sign-out is connected'
    });
});

router.post('/', (req, res) => {
    let userToken = req.headers.token;

    let signOutTask = [
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
                    callback(null, checkTokenResult.id)
                }
            })
        },
        (userId, callback) => {
            awsRDS.getConnection((connectingRDSError, connectingRDSResult) => {
                if(connectingRDSError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Connecting RDS fail',
                        contents : connectingRDSError
                    });

                    callback('Connecting RDS fail\n'+ connectingRDSError);
                } else {
                    callback(null, connectingRDSResult, userId);
                }
            });
        },
        (connection, userId, callback) => {
            let getUserTokenParameter = {
                id : userId,
                userJWTToken : userToken
            };
            let getUserTokenQuery = mybatis.mappingSQLStatement('users/accounts', 'sign_out', 'getUserToken', getUserTokenParameter);

            connection.query(getUserTokenQuery, (getUserTokenQueryError, getUserTokenQueryResult) => {
                if(getUserTokenQueryError) {
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Get user token query fail',
                        contents: getUserTokenQueryError
                    });

                    callback('Get user token query fail\n' + getUserTokenQueryError);
                } else if(getUserTokenQueryResult.length == 1) {
                    callback(null, connection, userId);
                } else {
                    connection.release();

                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Get user token query fail',
                        contents : 'No user with the id and token'
                    });

                    callback('Get user token query fail\nNo user with the id and token');
                }
            });
        },
        (connection, userId, callback) => {
            let setUserTokenParameter = {
                id : userId,
                userJWTToken : userToken
            };
            let setUserTokenQuery = mybatis.mappingSQLStatement('users/accounts', 'sign_out', 'setUserToken', setUserTokenParameter);

            connection.query(setUserTokenQuery, (setUserTokenQueryError, setUserTokenQueryResult) => {
                connection.release();
                
                if(setUserTokenQueryError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Set user token query fail',
                        contents : setUserTokenQueryError
                    });

                    callback('Set user token query fail\n' + setUserTokenQueryError);
                } else if(setUserTokenQueryResult.affectedRows == 1) {
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