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
    res.status(200).send({
        stat : "Success",
        msg : "URL /users/goods/add is connected"
    });
});

router.post('/', (req, res) => {
    let userToken = req.headers.token;
    let barcodeNumber = req.body.barcodeNumber;

    let addTask = [
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
            goodValidity.goodBarcodeCheck(barcodeNumber, (goodBarcodeCheckError, goodBarcodeCheckResult) => {
                if(goodBarcodeCheckError) {
                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Good barcode check fail',
                        contents : goodBarcodeCheckError
                    });

                    callback('Good barcode check fail\n' + goodBarcodeCheckError);
                } else {
                    callback(null, userId);
                }
            });
        },
        (userId, callback) => {
            barcode.sortBarcode(barcodeNumber, sortBarcodeResult => {
                callback(null, userId, sortBarcodeResult);
            });
        },
        (userId, sortedBarcodeNumber, callback) => {
            awsRDS.getConnection((connectingRDSError, connectingRDSResult) => {
                if(connectingRDSError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Connecting RDS fail',
                        contents : connectingRDSError
                    });
    
                    callback('Connecting RDS fail\n' + connectingRDSError);
                } else {
                    callback(null, connectingRDSResult, userId, sortedBarcodeNumber);
                }
            });
        },
        (connection, userId, sortedBarcodeNumber, callback) => {
            let getGoodIdParameter = sortedBarcodeNumber;
            let getGoodIdQuery = mybatis.mappingSQLStatement('users/goods', 'add', 'getGoodId', getGoodIdParameter);

            connection.query(getGoodIdQuery, (getGoodIdQueryError, getGoodIdQueryResult) => {
                if(getGoodIdQueryError) {
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Get good id query fail',
                        contents : getGoodIdQueryError
                    });
                } else if(getGoodIdQueryResult.length == 0) {
                    connection.release();

                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Get good id query fail',
                        contents : 'Not registered good, please ask to admin'
                    });
                } else {
                    callback(null, connection, userId, sortedBarcodeNumber, getGoodIdQueryResult[0].id);
                }
            });
        },
        (connection, userId, sortedBarcodeNumber, goodId, callback) => {
            let setCartDataParameter = {
                userId : userId,
                goodId : goodId
            };
            let setCartDataQuery = mybatis.mappingSQLStatement('users/goods', 'add', 'setCartData', setCartDataParameter);

            connection.query(setCartDataQuery, (setCartDataQueryError, setCartDataQueryResult) => {
                connection.release();
                
                if(setCartDataQueryError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Set cart data query fail',
                        contents : setCartDataQueryError
                    });

                    callback('Set cart data query fail\n' + setCartDataQueryError);
                } else {
                    res.status(201).send({
                        stat : 'Success',
                        title : 'Add cart data success',
                        contents : 'Add barcode to cart success'
                    });

                    callback(null, 'Add cart data success\nAdd barcode to cart success');
                }
            });
        }
    ];

    async.waterfall(addTask, (asyncError, asyncResult) => {
        if(asyncError) console.log('Async fail : Add task fail\n' + asyncError);
        else console.log('Async success : Add task success\n' + asyncResult);
    });
});

module.exports = router;