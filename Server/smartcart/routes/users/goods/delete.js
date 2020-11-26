const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../../private_modules/database/aws_rds');
const goodValidity = require('../../../private_modules/validity/good');
const tokenValidity = require('../../../private_modules/validity/token');
const mybatis = require('../../../private_modules/database/mybatis');
const jsonWebToken = require('../../../private_modules/json_web_token');

router.get('/', (req, res) => {
    res.status(200).send({
        stat : "Success",
        msg : "URL /users/goods/delete is connected"
    });
});

router.post('/', (req, res) => {
    let userToken = req.headers.token;
    let goodId = req.body.goodId;

    let deleteTask = [
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
            if(goodId) {
                let deleteUserCartDataParameter = {
                    userId : userId,
                    goodId : goodId
                };
                let deleteUserCartDataQuery = mybatis.mappingSQLStatement('users/goods', 'delete', 'deleteUserCartData', deleteUserCartDataParameter);

                connection.query(deleteUserCartDataQuery, (deleteUserCartDataQueryError, deleteUserCartDataQueryResult) => {
                    connection.release();
                    
                    if(deleteUserCartDataQueryError) {
                        res.status(500).send({
                            stat : 'Fail',
                            title : 'Delete user cart data query fail',
                            contents : deleteUserCartDataQueryError
                        });

                        callback('Delete user cart data query fail\n' + deleteUserCartDataQueryError);
                    } else {
                        res.status(201).send({
                            stat : 'Success',
                            title : 'Delete user cart data success',
                            contents : 'Delete cart data by userId and goodId'
                        });

                        callback(null, 'Delete user cart data success\nDelete cart data by userId and goodId');
                    }
                });
            } else {
                let deleteAllUserCartDataParameter = {
                    userId : userId
                }
                let deleteAllUserCartDataQuery = mybatis.mappingSQLStatement('users/goods', 'delete', 'deleteAllUserCartData', deleteAllUserCartDataParameter);

                connection.query(deleteAllUserCartDataQuery, (deleteAllUserCartDataQueryError, deleteAllUserCartDataQueryResult) => {
                    connection.release();

                    if(deleteAllUserCartDataQueryError) {
                        res.status(500).send({
                            stat : 'Fail',
                            title : 'Delete all user car data query fail',
                            contents : deleteAllUserCartDataQueryError
                        });

                        callback('Delete all user cart data query fail\n' + deleteAllUserCartDataQueryError);
                    } else {
                        res.status(201).send({
                            stat : 'Success',
                            title : 'Delete user cart data success',
                            contents : 'Delete all cart data by userId'
                        });

                        callback(null, 'Delete all user cart data success\nDelete all cart data by userId');
                    }
                })
            }
        }
    ];

    async.waterfall(deleteTask, (asyncError, asyncResult) => {
        if(asyncError) console.log('Async fail : Delete task fail\n' + asyncError);
        else console.log('Async success : Delete task success\n' + asyncResult);
    });
});

module.exports = router;