const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../../private_modules/database/aws_rds');
const tokenValidity = require('../../../private_modules/validity/token');
const mybatis = require('../../../private_modules/database/mybatis');
const jsonWebToken = require('../../../private_modules/json_web_token');
const taskUnion = require('../../../private_modules/task_union');
const jsonArrayToArray = require('../../../private_modules/database/json_array_to_array');
const awsS3 = require('../../../private_modules/database/aws_s3');

router.get('/', (req, res) => {
    res.status(200).send({
        stat : 'Success',
        msg : "URL /admins/goods/delete is connected"
    });
});

router.post('/', (req, res) => {
    let adminToken = req.headers.token;
    let goodDatas = req.body.goodDatas;
    
    let deleteTask = [
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
        },
        (connection, adminId, callback) => {
            connection.beginTransaction(beginTransactionError => {
                if(beginTransactionError) {
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Begin transaction fail',
                        contents : beginTransactionError
                    });
                } else {
                    let deleteGoodDataParameter = {
                        goodId : goodDatas.goodId
                    };
                    let deleteGoodDataQuery = mybatis.mappingSQLStatement('admins/goods', 'delete', 'deleteGoodData', deleteGoodDataParameter);

                    connection.query(deleteGoodDataQuery, (deleteGoodDataQueryError, deleteGoodDataQueryResult) => {
                        if(deleteGoodDataQueryError) {
                            connection.rollback();
                            connection.release();

                            res.status(500).send({
                                stat : 'Fail',
                                title : 'Delete good data query fail',
                                contents : deleteGoodDataQueryError
                            });

                            callback('Delete good data query fail\n' + deleteGoodDataQueryError);
                        } else {
                            callback(null, connection, adminId);
                        }
                    });
                }
            });
        },
        (connection, adminId, callback) => {
            let getCompanyGoodCountParameter = {
                companyId : goodDatas.companyId
            };
            let getCompanyGoodCountQuery = mybatis.mappingSQLStatement('admins/goods', 'delete', 'getCompanyGoodCount', getCompanyGoodCountParameter);

            connection.query(getCompanyGoodCountQuery, (getCompanyGoodCountQueryError, getCompanyGoodCountQueryResult) => {
                if(getCompanyGoodCountQueryError) {
                    connection.rollback();
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Get company good count query fail',
                        contents : getCompanyGoodCountQueryError
                    });

                    callback('Get company good count query fail\n' + getCompanyGoodCountQueryError);
                } else if(getCompanyGoodCountQueryResult[0].company_good_count >= 2) {
                    callback(null, connection, adminId, false);
                } else {
                    callback(null, connection, adminId, true);
                }
            });
        },
        (connection, adminId, isDeleteCompany, callback) => {
            if(isDeleteCompany) {
                let deleteCompanyDataParameter = {
                    companyId : goodDatas.companyId
                };
                let deleteCompanyDataQuery = mybatis.mappingSQLStatement('admins/goods', 'delete', 'deleteCompanyData', deleteCompanyDataParameter);

                connection.query(deleteCompanyDataQuery, (deleteCompanyDataQueryError, deleteCompanyDataQueryResult) => {
                    if(deleteCompanyDataQueryError) {
                        connection.rollback();
                        connection.release();

                        res.status(500).send({
                            stat : 'Fail',
                            title : 'Delete company data query fail',
                            contents : deleteCompanyDataQueryError
                        });

                        callback('Delete company data query fail\n' + deleteCompanyDataQueryError);
                    } else if(goodDatas.goodImageName == null || goodDatas.goodImageName == 'null') {
                        connection.commit();
                        connection.release();

                        res.status(201).send({
                            stat : 'Success',
                            title : 'Delete task success',
                            contents : 'Delete good and company data has succeed'
                        });

                        callback(null, 'Delete task success\nDelete good and company data has succeed');
                    } else {
                        awsS3.delete('goods', goodDatas.goodImageName, (awsS3DeleteError) => {
                            if(awsS3DeleteError) {
                                connection.rollback();
                                connection.release();

                                res.status(500).send({
                                    stat : 'Fail',
                                    title : 'Delete s3 image task fail',
                                    contents : awsS3DeleteError
                                });

                                callback('Delete s3 image task fail\n' + awsS3DeleteError);
                            } else {
                                connection.commit();
                                connection.release();

                                res.status(201).send({
                                    stat : 'Success',
                                    title : 'Delete task success',
                                    contents : 'Delete good and company data has succeed'
                                });

                                callback(null, 'Delete task success\nDelete good and company data has succeed');
                            }
                        });
                    }
                });
            } else {
                let setCompanyGoodCountParameter = {
                    companyId : goodDatas.companyId
                };
                let setCompanyGoodCountQuery = mybatis.mappingSQLStatement('admins/goods', 'delete', 'setCompanyGoodCount', setCompanyGoodCountParameter);

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
                    } else if(goodDatas.goodImageName == null || goodDatas.goodImageName == 'null') {
                        connection.commit();
                        connection.release();

                        res.status(201).send({
                            stat : 'Success',
                            title : 'Delete task success',
                            contents : 'Delete good data has succeed'
                        });

                        callback(null, 'Delete task success\nDelete good data has succeed');
                    } else {
                        awsS3.delete('goods', goodDatas.goodImageName, awsS3DeleteError => {
                            if(awsS3DeleteError) {
                                res.status(500).send({
                                    stat : 'Fail',
                                    title : 'Delete s3 image task fail',
                                    contents : awsS3DeleteError
                                });

                                callback('Delete s3 image task fail\n' + awsS3DeleteError);
                            }
                        });
                    }
                });
            }
        }
    ];

    async.waterfall(deleteTask, (asyncError, asyncResult) => {
        if(asyncError) console.log('Async fail : Delete goods task fail\n' + asyncError);
        else console.log('Async success : Delete goods task success\n' + asyncResult);
    });
});

module.exports = router;