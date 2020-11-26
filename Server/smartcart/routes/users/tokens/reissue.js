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
        msg: 'URL /user/tokens/issue is connected'
    });
});

router.post('/', (req, res) => {
    let userToken = req.headers.token;

    let reIssueTask = [
        (callback) => {
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
        },
        (connection, callback) => {
            let getUserIdParameter = {
                userJWTToken : userToken
            };
            let getUserIdQuery = mybatis.mappingSQLStatement('users/tokens', 'reissue', 'getUserId', getUserIdParameter);
            
            connection.query(getUserIdQuery, (getUserIdQueryError, getUserIdQueryResult) => {
                if(getUserIdQueryError) {
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Get user id query fail',
                        contents : getUserIdQueryError
                    });

                    callback('Get user id query fail\n' + getUserIdQueryError);
                } else if(getUserIdQueryResult.length == 0) {
                    connection.release();

                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Get user id query fail',
                        contents: 'No user with token value'
                    });

                    callback('Get user id query fail\nNo user with token value');
                } else {
                    callback(null, connection, getUserIdQueryResult[0].id);
                }
            });
        },
        (connection, userId, callback) => {
            jsonWebToken.createToken(userId, (createTokenError, createTokenResult) => {
                if(createTokenError) {
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Create token fail',
                        contents: createTokenError
                    });

                    callback('Create token fail\n' + createTokenError)
                } else {
                    callback(null, connection, userId, createTokenResult);
                }
            });
        },
        (connection, userId, userToken, callback) => {
            let setUserTokenParameter = {
                id : userId,
                userJWTToken : userToken
            };
            let setUserTokenQuery = mybatis.mappingSQLStatement('users/tokens', 'reissue', 'setUserToken', setUserTokenParameter);

            connection.query(setUserTokenQuery, (setUserTokenQueryError, setUserTokenQueryResult) => {
                connection.release();
                
                if(setUserTokenQueryError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Set user token query fail',
                        contents : setUserTokenQueryError
                    });

                    callback('Set user token query fail\n' + setUserTokenQueryError);
                } else if(setUserTokenQueryResult.affectedRows != 1) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Set user token query fail',
                        contents : 'Not updated user token, please ask to server admin'
                    });

                    callback('Set user token query fail\nNot updated user token, please ask to server admin');
                } else {
                    res.status(201).send({
                        stat : 'Success',
                        title : 'Reissue user token success',
                        contents : 'New user token is saved',
                        data : userToken
                    });

                    callback(null, 'Reissue user token success\nNew user token is saved');
                }
            });
        }
    ];

    async.waterfall(reIssueTask, (asyncError, asyncResult) => {
        if(asyncError) console.log('Async fail : Reissue token fail\n' + asyncError);
        else console.log('Async Success : Reissue token success\n' + asyncResult);
    })
});

module.exports = router;