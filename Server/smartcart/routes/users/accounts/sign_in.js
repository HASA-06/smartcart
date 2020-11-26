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
        stat : 'Success',
        msg : 'URL /user/accounts/sign-in is connected'
    })
});

router.post('/', (req, res) => {
    let userDatas = {
        email : req.body.userEmail,
        password : req.body.userPassword
    };
    userDatas.count = Object.keys(userDatas).length;
    userDatas.keys = ['email', 'password'];

    let signInTask = [
        (callback) => {
            accountValidity.signInCheck(userDatas, (signInCheckError, signInCheckResult) => {
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
            let getUserPasswordParameter = {
                userEmail : userDatas.email
            };
            let getUserPasswordQuery = mybatis.mappingSQLStatement('users/accounts', 'sign_in', 'getUserPassword', getUserPasswordParameter);
            
            connection.query(getUserPasswordQuery, (getUserPasswordQueryError, getUserPasswordQueryResult) => {
                if(getUserPasswordQueryError) {
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Sign in query fail',
                        contents : getUserPasswordQueryError
                    });

                    callback('Sign in query fail\n' + getUserPasswordQueryError);
                } else if(getUserPasswordQueryResult[0] === undefined) {
                    connection.release();

                    res.status(400).send({
                        stat : 'Fail',
                        title : 'No user',
                        contents : 'Please check your email'
                    });

                    callback('No user\nPlease check your email');
                } else {
                    callback(null, connection, getUserPasswordQueryResult[0]);
                }
            });
        },
        (connection, savedUserDatas, callback) => {
            encryption(userDatas.password, savedUserDatas.user_salt, (encryptionError, salt, encryptionResult) => {
                if(encryptionError) {
                    connection.release();
                    
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Encryption fail',
                        contents : encryptionError
                    });

                    callback('Encryption fail\n' + encryptionError);
                } else if(encryptionResult == savedUserDatas.user_password) {
                    callback(null, connection, savedUserDatas);
                } else {
                    connection.release();

                    res.status(400).send({
                        stat : 'Fail',
                        title : 'No user',
                        contents : 'Please check your password'
                    });

                    callback('No user\nPlease check your password');
                }
            });
        },
        (connection, savedUserDatas, callback) => {
            jsonWebToken.createToken(savedUserDatas.id,(createTokenError, createTokenResult) => {
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
                    callback(null, connection, savedUserDatas, createTokenResult);
                }
            });
        },
        (connection, savedUserDatas, token, callback) => {
            let setUserTokenParameter= {
                id : savedUserDatas.id,
                userJWTToken : token
            };
            let setUserTokenQuery = mybatis.mappingSQLStatement('users/accounts', 'sign_in', 'setUserToken', setUserTokenParameter);
            
            connection.query(setUserTokenQuery, (setUserTokenQueryError, setUserTokenQueryResult) => {
                connection.release();
                
                if(setUserTokenQueryError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Save token fail',
                        contents : setUserTokenQueryError
                    });

                    callback('Save token fail\n' + setUserTokenQueryError);
                } else if(setUserTokenQueryResult.affectedRows == 1) {
                    res.status(201).send({
                        stat : 'Success',
                        title : 'Sign in success',
                        contents : 'Happy to your sign in!',
                        data : token,
                        userName : savedUserDatas.user_name,
                        userId : savedUserDatas.id
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