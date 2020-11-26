const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../../private_modules/database/aws_rds');
const accountValidity = require('../../../private_modules/validity/account');
const tokenValidity = require('../../../private_modules/validity/token');
const mybatis = require('../../../private_modules/database/mybatis');
const encryption = require('../../../private_modules/encryption');
const jsonWebToken = require('../../../private_modules/json_web_token');

router.get('/', (req, res) => {
    res.status(200).send({
        stat : "Success",
        msg : "URL /admins/accounts/regist is connected"
    });
});

router.post('/', (req, res) => {
    let adminToken = req.headers.token;
    let newAdminDatas = {
        email : req.body.adminEmail,
        password : req.body.adminPassword,
        passwordAccept : req.body.adminPasswordAccept,
        name : req.body.adminName
    };
    newAdminDatas.count = Object.keys(newAdminDatas).length;
    newAdminDatas.keys = ['email', 'password', 'passwordAccept', 'name'];

    let registTask = [
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
            accountValidity.registCheck(newAdminDatas, (registCheckError, registCheckResult) => {
                if(registCheckError) {
                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Regist check fail',
                        contents : registCheckError
                    });

                    callback('Regist check fail\n' + registCheckError);
                } else {
                    callback(null, registCheckResult);
                }
            });
        },
        (registCheckResult, callback) => {
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
            let adminConfig = '1';

            if(adminConfig.indexOf(adminId) >= 0) {
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
            } else {
                res.status(400).send({
                    stat : 'Fail',
                    title : 'Regist new admin fail',
                    contents : 'You\'re not top admin, your authority is not enough'
                });

                callback('Regist new admin fail\nYou\'re not top admin, your authority is not enough');
            }
        },
        (connection, callback) => {
            let getAdminDataParameter = {
                adminEmail : newAdminDatas.email
            };
            let getAdminDataQuery = mybatis.mappingSQLStatement('admins/accounts', 'regist', 'getAdminData', getAdminDataParameter);

            connection.query(getAdminDataQuery, (getAdminDataQueryError, getAdminDataQueryResult) => {
                if(getAdminDataQueryError) {
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Get admin data query fail',
                        contents : getAdminDataQueryError
                    });

                    callback('Get admin data query fail\n' + getAdminDataQueryError);
                } else if(getAdminDataQueryResult.length >= 1) {
                    connection.release();

                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Duplicated email',
                        contents : 'This email has duplicated'
                    });

                    callback('Duplicated email\nThis email has duplicated');
                } else {
                    callback(null, connection);
                }
            });
        },
        (connection, callback) => {
            encryption(newAdminDatas.password, 'empty', (encryptionError, salt, encryptionResult) => {
                if(encryptionError) {
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Encryption fail',
                        contents : encryptionError
                    });

                    callback('Encryption fail\n' + encryptionError);
                } else {
                    callback(null, connection, salt, encryptionResult);
                }
            });
        },
        (connection, salt, hashedPassword, callback) => {
            let setNewAdminDataParameter = {
                adminEmail : newAdminDatas.email,
                adminPassword : hashedPassword,
                adminSalt : salt,
                adminName : newAdminDatas.name
            };
            let setNewAdminDataQuery = mybatis.mappingSQLStatement('admins/accounts', 'regist', 'setNewAdminData', setNewAdminDataParameter);

            connection.query(setNewAdminDataQuery, (setNewAdminDataQueryError, setNewAdminDataQueryResult) => {
                connection.release();
                
                if(setNewAdminDataQueryError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Set new admin data query fail',
                        contents : setNewAdminDataQueryError
                    });

                    callback('Set new admin data query fail\n' + setNewAdminDataQueryError);
                } else {
                    res.status(201).send({
                        stat : 'Success',
                        title : 'Regist new admin is success',
                        contents : 'Happy to add new admin!'
                    });

                    callback(null, 'Regist new admin is success\nHappy to add new admin');
                }
            });
        }
    ];

    async.waterfall(registTask, (asyncError, asyncResult) => {
        if(asyncError) console.log('Async Fail : Regist error\n' + asyncError);
        else console.log('Async Success : Regist success\n' + asyncResult);
    });
});

module.exports = router;