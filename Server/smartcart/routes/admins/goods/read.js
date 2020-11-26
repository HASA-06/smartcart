const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../../private_modules/database/aws_rds');
const tokenValidity = require('../../../private_modules/validity/token');
const goodValidity = require('../../../private_modules/validity/good');
const mybatis = require('../../../private_modules/database/mybatis');
const jsonWebToken = require('../../../private_modules/json_web_token');
const taskUnion = require('../../../private_modules/task_union');

router.get('/', (req, res) => {
    let lastGoodId = req.query.lastGoodId;
    let goodId = req.query.goodId;
    let adminToken = req.headers.token;

    let readGoodCommonTask = [
        (callback) => {
            tokenValidity.tokenCheck(adminToken, (tokenCheckError, tokenCheckResult) => {
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
            jsonWebToken.checkToken(adminToken, (checkTokenError, checkTokenResult) => {
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
        (adminId, callback) => {
            awsRDS.getConnection((connectingRDSError, connectingRDSResult) => {
                if(connectingRDSError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Connecting RDS fail',
                        contents : connectingRDSError
                    });
    
                    callback('Connecting RDS fail\n' + connectingRDSError);
                } else {
                    callback(null, connectingRDSResult, adminId);
                }
            });
        }
    ];

    let readGoodAllTask = [
        (connection, adminId, callback) => {
            if(lastGoodId) {
                let getMoreGoodDatasParameter = {
                    lastGoodId : lastGoodId
                };
                let getMoreGoodDatasQuery = mybatis.mappingSQLStatement('admins/goods', 'read', 'getMoreGoodDatas', getMoreGoodDatasParameter);

                connection.query(getMoreGoodDatasQuery, (getMoreGoodDatasQueryError, getMoreGoodDatasQueryResult) => {
                    connection.release();

                    if(getMoreGoodDatasQueryError) {
                        res.status(500).send({
                            stat : 'Fail',
                            title : 'Get more good datas query fail',
                            contents : getMoreGoodDatasQueryError
                        });

                        callback('Get more good datas query fail\n' + getMoreGoodDatasQueryError);
                    } else {
                        res.status(200).send({
                            stat : 'Success',
                            title : 'Read more good task success',
                            contents : 'Read all good datas success, please check \'data\' part',
                            data : getMoreGoodDatasQueryResult
                        });

                        callback(null, 'Read more good task success\nRead more good datas success, please check \'data\' part');
                    }
                });
            } else {
                let getAllGoodDatasQuery = mybatis.mappingSQLStatement('admins/goods', 'read', 'getAllGoodDatas', null);

                connection.query(getAllGoodDatasQuery, (getAllGoodDatasQueryError, getAllGoodDatasQueryResult) => {
                    connection.release();
                    
                    if(getAllGoodDatasQueryError) {
                        res.status(500).send({
                            stat : 'Fail',
                            title : 'Get all good datas query fail',
                            contents : getAllGoodDatasQueryError
                        });

                        callback('Get all good datas query fail\n' + getAllGoodDatasQueryError);
                    } else if(getAllGoodDatasQueryResult.length == 0) {
                        res.status(200).send({
                            stat : 'Success',
                            title : 'Read all good task success',
                            contents : 'Read all good datas success, but no data in database'
                        });

                        callback(null, 'Read all good task success\nRead all good datas success, but no data in database');
                    } else {
                        res.status(200).send({
                            stat : 'Success',
                            title : 'Read all good task success',
                            contents : 'Read all good datas success, please check \'data\' part',
                            data : getAllGoodDatasQueryResult
                        });

                        callback(null, 'Read all good task success\nRead all good datas success, please check \'data\' part');
                    }
                });
            }
        }
    ];

    let readGoodByIdTask = [
        (connection, adminId, callback) => {
            goodValidity.goodIdCheck(goodId, (goodIdCheckError, goodIdCheckResult) => {
                if(goodIdCheckError) {
                    connection.release();

                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Good id check fail',
                        contents : goodIdCheckError
                    });

                    callback('Good id check fail\n' + goodIdCheckError);
                } else {
                    callback(null, connection, adminId);
                }
            });
        },
        (connection, adminId, callback) => {
            let getGoodDatasByIdParameter = {
                goodId : goodId
            };
            let getGoodDatasByIdQuery = mybatis.mappingSQLStatement('admins/goods', 'read', 'getGoodDatasById', getGoodDatasByIdParameter);

            connection.query(getGoodDatasByIdQuery, (getGoodDatasByIdQueryError, getGoodDatasByIdQueryResult) => {
                connection.release();
                
                if(getGoodDatasByIdQueryError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Get good datas by id query fail',
                        contents : getGoodDatasByIdQueryError
                    });

                    callback('Get good datas by id query fail\n' + getGoodDatasByIdQueryError);
                } else {
                    res.status(200).send({
                        stat : 'Success',
                        title : 'Read good by id task success',
                        contents : 'Read good datas by id success, please check \'data\' part',
                        data : getGoodDatasByIdQueryResult
                    });

                    callback(null, 'Read good by id task success\nRead good datas by id success, please check \'data\' part');
                }
            });
        }
    ];

    taskUnion.doubleTask(goodId, readGoodCommonTask, readGoodByIdTask, readGoodAllTask).then(readBarcodeTask => {
        async.waterfall(readBarcodeTask, (asyncError, asyncResult) => {
            if(asyncError) console.log('Async fail : Read barcode fail\n' + asyncError);
            else console.log('Async success : Read barcode success\n'+ asyncResult);
        });
    });
});

module.exports = router;