const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../../private_modules/database/aws_rds');
const goodValidity = require('../../../private_modules/validity/good');
const tokenValidity = require('../../../private_modules/validity/token');
const mybatis = require('../../../private_modules/database/mybatis');
const jsonWebToken = require('../../../private_modules/json_web_token');
const jsonArrayToArray = require('../../../private_modules/database/json_array_to_array');

router.get('/', (req, res) => {
    let userToken = req.headers.token;
    let userCartGoodCount;

    let readTask = [
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
            let getCartGoodIdParameter = {
                userId : userId
            };
            let getCartGoodIdQuery = mybatis.mappingSQLStatement('users/goods', 'read', 'getCartGoodId', getCartGoodIdParameter);

            connection.query(getCartGoodIdQuery, (getCartGoodIdQueryError, getCartGoodIdQueryResult) => {
                if(getCartGoodIdQueryError) {
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Get cart good id query fail',
                        contents : getCartGoodIdQueryError
                    });

                    callback('Get cart good id query fail\n' + getCartGoodIdQueryError);
                } else if(getCartGoodIdQueryResult.length == 0) {
                    connection.release();

                    res.status(200).send({
                        stat : 'Success',
                        title : 'No goods',
                        contents : 'No goods in user\'s cart'
                    });

                    callback('No goods');
                } else {
                    userCartGoodCount = getCartGoodIdQueryResult.length;

                    callback(null, connection, userId, jsonArrayToArray(getCartGoodIdQueryResult, 'good_id'), jsonArrayToArray(getCartGoodIdQueryResult, 'good_count'));
                }
            })
        },
        (connection, userId, goodIds, goodCounts, callback) => {
            let getGoodDatasParameter = {
                goodIds : goodIds
            };
            let getGoodDatasQuery = mybatis.mappingSQLStatement('users/goods', 'read', 'getGoodDatas', getGoodDatasParameter);

            connection.query(getGoodDatasQuery, (getGoodDatasQueryError, getGoodDatasQueryResult) => {
                connection.release();

                if(getGoodDatasQueryError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Get good datas query fail',
                        contents : getGoodDatasQueryError
                    });

                    callback('Get good datas query fail\n' + getGoodDatasQueryError);
                } else {
                    var goodTotalPrice = 0;

                    for(var index = 0; index < goodIds.length; index++) {
                        getGoodDatasQueryResult[index]['goodCount'] = goodCounts[index];
                        goodTotalPrice += (parseInt(getGoodDatasQueryResult[index].goodPrice) * parseInt(getGoodDatasQueryResult[index].goodCount));
                        if(index == goodIds.length - 1) {
                            res.status(200).send({
                                stat : 'Success',
                                title : 'Read task success',
                                contents : 'Read user\'s cart good data has succeed, please check \'data\' part from response\'s body',
                                data : {
                                    goodDatas : getGoodDatasQueryResult,
                                    goodTotalCount : userCartGoodCount,
                                    goodTotalPrice : goodTotalPrice
                                }
                            });
                        }
                    }

                    callback(null, 'Read task success\nRead user\'s cart good data has succeed, please check \'data\' part from response\'s body');
                }
            });
        }
    ];

    async.waterfall(readTask, (asyncError, asyncResult) => {
        if(asyncError) console.log('Async fail : Read task fail\n' + asyncError);
        else console.log('Async success : Read task success\n' + asyncResult);
    });
});

module.exports = router;