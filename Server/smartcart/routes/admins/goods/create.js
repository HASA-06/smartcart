const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../../private_modules/database/aws_rds');
const goodValidity = require('../../../private_modules/validity/good');
const tokenValidity = require('../../../private_modules/validity/token');
const mybatis = require('../../../private_modules/database/mybatis');
const jsonWebToken = require('../../../private_modules/json_web_token');
const taskUnion = require('../../../private_modules/task_union');
const awsS3 = require('../../../private_modules/database/aws_s3');

router.get('/', (req, res) => {
    res.status(200).send({
        stat : 'Success',
        msg : "URL /admins/goods/create-new is connected"
    });
});

router.post('/', awsS3.upload.single('goodImage'), (req, res) => {
    let adminToken = req.headers.token;
    let createType = req.body.type;

    let createCommonTask = [
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

    let createNewTask = [
        (connection, adminId, callback) => {
            let goodDatas = {
                companyName : req.body.companyName,
                goodName : req.body.goodName,
                goodImageUrl : (req.file) ? req.file.location : null,
                goodImageName : (req.file) ? req.file.originalname.split('.')[0] + '.' + req.file.originalname.split('.').pop() : null,
                goodPrice : req.body.goodPrice,
                nationCode : req.body.nationCode,
                companyCode : req.body.companyCode,
                goodCode : req.body.goodCode,
                checkDigit : req.body.checkDigit
            };
            goodDatas.count = Object.keys(goodDatas).length;
            goodDatas.keys = ["companyName", "goodName", "goodImageUrl", "goodImageName", "goodPrice", "nationCode", "companyCode", "goodCode", "checkDigit"];
            
            goodValidity.emptyCheck(goodDatas, (emptyCheckError, emptyCheckResult) => {
                if(emptyCheckError) {
                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Good check fail',
                        contents : emptyCheckError
                    });

                    callback('Good check fail\n' + emptyCheckError);
                } else {
                    callback(null, connection, adminId, goodDatas);
                }
            });
        },
        (connection, adminId, goodDatas, callback) => {
            connection.beginTransaction(beginTransactionError => {
                if(beginTransactionError) {
                    connection.release();
                    
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Begin transaction fail',
                        contents : beginTransactionError
                    });

                    callback('Begin transaction fail\n' + beginTransactionError);
                } else {
                    let isRegisteredCompanyParameter = {
                        nationCode : goodDatas.nationCode,
                        companyCode : goodDatas.companyCode
                    };

                    let isRegisteredCompanyQuery = mybatis.mappingSQLStatement('admins/goods', 'create', 'isRegisteredCompany', isRegisteredCompanyParameter);

                    connection.query(isRegisteredCompanyQuery, (isRegisteredCompanyQueryError, isRegisteredCompanyQueryResult) => {
                        if(isRegisteredCompanyQueryError) {
                            connection.rollback();
                            connection.release();

                            res.status(500).send({
                                stat : 'Fail',
                                title : 'Is registered company query fail',
                                contents : isRegisteredCompanyQueryError
                            });

                            callback('Is registered company query fail\n' + isRegisteredCompanyQueryError);
                        } else if(isRegisteredCompanyQueryResult.length == 1) {
                            goodDatas.companyName = isRegisteredCompanyQueryResult[0].company_name;
                            callback(null, connection, adminId, goodDatas, isRegisteredCompanyQueryResult[0].id);
                        } else {
                            callback(null, connection, adminId, goodDatas, null);
                        }
                    })
                }
            });
        },
        (connection, adminId, goodDatas, lastCompanyId, callback) => {
            if(lastCompanyId == null) {
                let setCompanyDataParameter = {
                    companyName : goodDatas.companyName,
                    nationCode : goodDatas.nationCode,
                    companyCode : goodDatas.companyCode
                };

                let setCompanyDataQuery = mybatis.mappingSQLStatement('admins/goods', 'create', 'setCompanyData', setCompanyDataParameter);

                connection.query(setCompanyDataQuery, (setCompanyDataQueryError, setCompanyDataQueryResult) => {
                    if(setCompanyDataQueryError) {
                        connection.rollback();
                        connection.release();

                        res.status(500).send({
                            stat : 'Fail',
                            title : 'Set company data query fail',
                            contents : setCompanyDataQueryError
                        });

                        callback('Set company data query fail\n' + setCompanyDataQueryError);
                    } else {
                        callback(null, connection, adminId, goodDatas, setCompanyDataQueryResult.insertId);
                    }
                });
            } else {
                let setCompanyGoodCountParameter = {
                    companyId : lastCompanyId
                };
                let setCompanyGoodCountQuery = mybatis.mappingSQLStatement('admins/goods', 'create', 'setCompanyGoodCount', setCompanyGoodCountParameter);

                connection.query(setCompanyGoodCountQuery, (setCompanyGoodCountQueryError, setCompanyGoodCountQueryResult) => {
                    if(setCompanyGoodCountQueryError) {
                        connection.rollback();
                        connection.release();

                        res.status(500).send({
                            stat : 'Fail',
                            title : 'Set company good count query fail',
                            contents : setCompanyGoodCountQueryError
                        });

                        callback('Set company good count query fail\n' + setCompanyGoodCountQueryError);
                    } else {
                        callback(null, connection, adminId, goodDatas, lastCompanyId);
                    }
                });
            }
        },
        (connection, adminId, goodDatas, lastCompanyId, callback) => {
            let setGoodDataParameter = {
                goodName : goodDatas.goodName,
                goodImageUrl : goodDatas.goodImageUrl,
                goodImageName : goodDatas.goodImageName,
                nationCode : goodDatas.nationCode,
                companyCode : goodDatas.companyCode,
                goodCode : goodDatas.goodCode,
                checkDigit : goodDatas.checkDigit,
                goodPrice : goodDatas.goodPrice,
                companyId : lastCompanyId
            };

            let setGoodDataQuery = mybatis.mappingSQLStatement('admins/goods', 'create', 'setGoodData', setGoodDataParameter);

            connection.query(setGoodDataQuery, (setGoodDataQueryError, setGoodDataQueryResult) => {
                if(setGoodDataQueryError) {
                    connection.rollback();
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Set good data query fail',
                        contents : setGoodDataQueryError
                    });

                    callback('Set good data query fail\n' + setGoodDataQueryError);
                } else {
                    connection.commit();
                    connection.release();

                    res.status(201).send({
                        stat : 'Success',
                        title : 'Create task success',
                        contents : 'Create new good task success',
                    });

                    callback(null, 'Create task success\nCreate new good task success');
                }
            });
        }
    ];

    let createRegisteredTask = [
        (connection, adminId, callback) => {
            let goodId = req.body.goodId;

            goodValidity.goodIdCheck(goodId, (goodIdCheckError, goodIdCheckResult) => {
                if(goodIdCheckError) {
                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Good id check fail',
                        contents : goodIdCheckError
                    });

                    callback('Good id check fail\n' + goodIdCheckError);
                } else {
                    callback(null, connection, adminId, goodId);
                }
            });
        },
        (connection, adminId, goodId, callback) => {
            let setGoodCountParameter = {
                goodId : goodId,
                goodCount : req.body.goodCount
            };

            let setGoodCountQuery = mybatis.mappingSQLStatement('admins/goods', 'create', 'setGoodCount', setGoodCountParameter);

            connection.query(setGoodCountQuery, (setGoodCountQueryError, setGoodCountQueryResult) => {
                connection.release();
                
                if(setGoodCountQueryError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Set good count query fail',
                        contents : setGoodCountQueryError
                    });

                    callback('Set good count query fail\n' + setGoodCountQueryError);
                } else {
                    res.status(201).send({
                        stat : 'Success',
                        title : 'Create task success',
                        contents : 'Create registered good task success'
                    });

                    callback(null, 'Create task success\nCreate registered good task success');
                }
            });
        }
    ];

    taskUnion.doubleTask(createType, createCommonTask, createNewTask, createRegisteredTask).then(createTask => {
        async.waterfall(createTask, (asyncError, asyncResult) => {
            if(asyncError) console.log('Async fail : Create task fail\n' + asyncError);
            else console.log('Async success : Create task success\n'+ asyncResult);
        });
    });
});

module.exports = router;