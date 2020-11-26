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
        stat : 'Success',
        msg : "URL /admins/goods/update is connected"
    });
});

router.post('/', (req, res) => {
    /*
        새로운 값이 들어올 필요가 없으면, 기존 값이라도 그대로 보내주면 된다.
    */
    let adminToken = req.headers.token;
    let updateDatas = {
        companyId : req.body.goodDatas.companyId,
        companyName : req.body.goodDatas.companyName,
        goodId : req.body.goodDatas.goodId,
        goodName : req.body.goodDatas.goodName,
        goodImageUrl : req.body.goodDatas.goodImageUrl,
        goodPrice : req.body.goodDatas.goodPrice,
        goodSaleStatus : req.body.goodDatas.goodSaleStatus,
        nationCode : req.body.goodDatas.nationCode,
        companyCode : req.body.goodDatas.companyCode,
        goodCode : req.body.goodDatas.goodCode,
        checkDigit : req.body.goodDatas.checkDigit
    };
    updateDatas.count = Object.keys(updateDatas).length;
    updateDatas.keys = ["companyId", "companyName", "goodId", "goodName", "goodImageUrl", "goodPrice", "goodSaleStatus", "nationCode", "companyCode", "goodCode", "checkDigit"];
    
    let updateTask = [
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
            goodValidity.goodUpdateCheck(updateDatas, (goodCheckError, goodCheckResult) => {
                if(goodCheckError) {
                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Good check fail',
                        content : goodCheckError
                    });

                    callback('Good check fail\n' + goodCheckError);
                } else {
                    callback(null, goodCheckResult);
                }
            });
        },
        (goodCheckResult, callback) => {
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
            delete updateDatas.count;
            delete updateDatas.keys;

            let setGoodAndCompanyDataParameter = updateDatas;
            let setGoodAndCompanyDataQuery = mybatis.mappingSQLStatement('admins/goods', 'update', 'setGoodAndCompanyData', setGoodAndCompanyDataParameter);
            
            connection.query(setGoodAndCompanyDataQuery, (setGoodAndCompanyDataQueryError, setGoodAndCompanyDataQueryResult) => {
                connection.release();
                
                if(setGoodAndCompanyDataQueryError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Set good and company data fail',
                        contents : setGoodAndCompanyDataQueryError
                    });

                    callback('Set good and company data fail\n' + setGoodAndCompanyDataQueryError);
                } else {
                    res.status(201).send({
                        stat : 'Success',
                        title : 'Update task success',
                        contents : 'Update good and company data success'
                    });

                    callback(null, 'Update task success\nUpdate good and company data success');
                }
            });
        }
    ];

    async.waterfall(updateTask, (asyncError, asyncResult) => {
        if(asyncError) console.log('Async fail : Update good and company data fail\n' + asyncError);
        else console.log('Async success : Update good and company data success\n' + asyncResult);
    });
});

module.exports = router;