const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../../private_modules/database/aws_rds');
const goodValidity = require('../../../private_modules/validity/good');
const tokenValidity = require('../../../private_modules/validity/token');
const mybatis = require('../../../private_modules/database/mybatis');
const jsonWebToken = require('../../../private_modules/json_web_token');
const barcode = require('../../../private_modules/barcode');


router.get('/', (req, res) => {
    let adminToken = req.headers.token;
    let goodDatas = {
        barcodeNumber : req.query.goodBarcodeNumber
    };
    goodDatas.count = Object.keys(goodDatas).length;
    goodDatas.keys = ["barcodeNumber"];

    let checkTask = [
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
            goodValidity.goodCheck(goodDatas, (goodCheckError, goodCheckResult) => {
                if(goodCheckError) {
                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Good check fail',
                        contents : goodCheckError
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
            barcode.sortBarcode(goodDatas.barcodeNumber, (sortBarcodeResult) => {
                goodDatas.nationCode = sortBarcodeResult.nationCode;
                goodDatas.companyCode = sortBarcodeResult.companyCode;
                goodDatas.goodCode = sortBarcodeResult.goodCode;
                goodDatas.checkDigit = sortBarcodeResult.checkDigit;
                
                callback(null, adminId);
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
            let isRegisteredGoodParameter = {
                nationCode : goodDatas.nationCode,
                companyCode : goodDatas.companyCode,
                goodCode : goodDatas.goodCode,
                checkDigit : goodDatas.checkDigit
            };
            
            let isRegisteredGoodQuery = mybatis.mappingSQLStatement('admins/goods', 'check', 'isRegisteredGood', isRegisteredGoodParameter);

            connection.query(isRegisteredGoodQuery, (isRegisteredGoodQueryError, isRegisteredGoodQueryResult) => {
                connection.release();
                
                if(isRegisteredGoodQueryError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Is registered barcode query fail',
                        contents : isRegisteredGoodQueryError
                    });

                    callback('Is registered barcode query fail\n'+ isRegisteredGoodQueryError);
                } else if(isRegisteredGoodQueryResult.length >= 1) {
                    res.status(200).send({
                        stat : 'Success',
                        type : 'Registered',
                        data : goodDatas,
                        goodId : isRegisteredGoodQueryResult[0].id,
                        title : 'Is registered barcode',
                        contents : 'It\'s already registered barcode'
                    });

                    callback(null, 'Is registered barcode\nIt\'s already registered barcode');
                } else {
                    res.status(200).send({
                        stat : 'Success',
                        type : 'New',
                        data : goodDatas,
                        title : 'Is new good',
                        contents : 'It\'s new good, please add'
                    });

                    callback(null, 'Is new good\nIt\'s new good, please add');
                }
            });
        }
    ];

    async.waterfall(checkTask, (asyncError, asyncResult) => {
        if(asyncError) console.log('Async fail : Check barcode number fail\n' + asyncError);
        else console.log('Async success : Check barcode number success' + asyncResult);
    });
});

module.exports = router;