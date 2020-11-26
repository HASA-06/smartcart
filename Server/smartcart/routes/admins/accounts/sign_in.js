const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../../private_modules/database/aws_rds');
const accountValidity = require('../../../private_modules/validity/account');
const mybatis = require('../../../private_modules/database/mybatis');
const encryption = require('../../../private_modules/encryption');
const jsonWebToken = require('../../../private_modules/json_web_token');

router.get('/', (req, res) => {
    res.status(200).send({
        stat : "Success",
        msg : "URL /admins/accounts/sign-in is connected"
    });
});

router.post('/', (req, res) => {
    let adminDatas = {
        email : req.body.adminEmail,
        password : req.body.adminPassword
    };
    adminDatas.count = Object.keys(adminDatas).length;
    adminDatas.keys = ['email', 'password'];

    let signInTask = [
        (callback) => {
            accountValidity.signInCheck(adminDatas, (signInCheckError, signInCheckResult) => {
                if(signInCheckError) {
                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Sign in check fail',
                        contents : signInCheckError
                    });

                    callback('Sign in check fail\n' + signInCheckError);
                } else {
                    callback(null, signInCheckResult);
                }
            });
        },
        (signInCheckResult, callback) => {
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
            let getAdminPasswordParameter = {
                adminEmail : adminDatas.email
            };
            let getAdminPasswordQuery = mybatis.mappingSQLStatement('admins/accounts', 'sign_in', 'getAdminPassword', getAdminPasswordParameter);
            
            connection.query(getAdminPasswordQuery, (getAdminPasswordQueryError, getAdminPasswordQueryResult) => {
                if(getAdminPasswordQueryError) {
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Sign in query fail',
                        contents : getAdminPasswordQueryError
                    });

                    callback('Sign in query fail\n' + getAdminPasswordQueryError);
                } else if(getAdminPasswordQueryResult[0] === undefined) {
                    connection.release();

                    res.status(400).send({
                        stat : 'Fail',
                        title : 'No admin',
                        contents : 'Please check your email'
                    });

                    callback('No admin\nPlease check your email');
                } else {
                    callback(null, connection, getAdminPasswordQueryResult[0]);
                }
            });
        },
        (connection, savedAdminsDatas, callback) => {
            encryption(adminDatas.password, savedAdminsDatas.admin_salt, (encryptionError, salt, encryptionResult) => {
                if(encryptionError) {
                    connection.release();
                    
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Encryption fail',
                        contents : encryptionError
                    });

                    callback('Encryption fail\n' + encryptionError);
                } else if(encryptionResult == savedAdminsDatas.admin_password) {
                    callback(null, connection, savedAdminsDatas);
                } else {
                    connection.release();

                    res.status(400).send({
                        stat : 'Fail',
                        title : 'No admin',
                        contents : 'Please check your password'
                    });

                    callback('No admin\nPlease check your password');
                }
            });
        },
        (connection, savedAdminsDatas, callback) => {
            jsonWebToken.createToken(savedAdminsDatas.id,(createTokenError, createTokenResult) => {
                if(createTokenError) {
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Create jwt fail',
                        contents : createTokenError
                    });

                    callback('Create jwt fail\n' + createTokenError);
                }
                else {
                    callback(null, connection, savedAdminsDatas, createTokenResult);
                }
            });
        },
        (connection, savedAdminsDatas, token, callback) => {
            let setAdminTokenParameter= {
                id : savedAdminsDatas.id,
                adminJWTToken : token
            };
            let setAdminTokenQuery = mybatis.mappingSQLStatement('admins/accounts', 'sign_in', 'setAdminToken', setAdminTokenParameter);
            
            connection.query(setAdminTokenQuery, (setAdminTokenQueryError, setAdminTokenQueryResult) => {
                connection.release();
                
                if(setAdminTokenQueryError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Save token fail',
                        contents : setAdminTokenQueryError
                    });

                    callback('Save token fail\n' + setAdminTokenQueryError);
                } else if(setAdminTokenQueryResult.affectedRows == 1) {
                    res.status(201).send({
                        stat : 'Success',
                        title : 'Sign in success',
                        contents : 'Happy to your sign in!',
                        adminName : savedAdminsDatas.admin_name,
                        data : token
                    });

                    callback(null, 'Sign in success\nHappy to your sign in!');
                } else {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Unsuspected fail',
                        contents : 'Please ask to server admin'
                    });

                    callback('Unsuspected fail\nPlease ase to server admin');
                }
            });
        }
    ];

    async.waterfall(signInTask, (asyncError, asyncResult) => {
        if(asyncError) console.log('Async Fail : Sign-in error\n' + asyncError);
        else console.log('Async Success : Sign-in success\n' + asyncResult);
    });
});

module.exports = router;