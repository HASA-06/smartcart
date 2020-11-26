const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../../private_modules/database/aws_rds');
const accountValidity = require('../../../private_modules/validity/account');
const mybatis = require('../../../private_modules/database/mybatis')
const encryption = require('../../../private_modules/encryption');

router.get('/', (req, res) => {
    res.status(200).send({
        stat: 'Success',
        msg: 'URL /users/accounts/sign-up is connected'
    });
});

router.post('/', (req, res) => {
    let userDatas = {
        email : req.body.userEmail,
        password : req.body.userPassword,
        passwordAccept : req.body.userPasswordAccept,
        name : req.body.userName,
        phoneNumber : req.body.userPhoneNumber.replace(/\-/g, '')
    };
    userDatas.count = Object.keys(userDatas).length;
    userDatas.keys = ['email', 'password', 'passwordAccept', 'name', 'phoneNumber'];

    let signUpTask = [
        (callback) => {
            accountValidity.signUpCheck(userDatas, (signUpCheckError, signUpCheckResult) => {
                if(signUpCheckError) {
                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Sign up check fail',
                        contents : signUpCheckError
                    });

                    callback('Sign up check fail\n'+ signUpCheckError);
                } else {
                    callback(null, signUpCheckResult);
                }
            });
        },
        (signUpCheckResult, callback) => {
            awsRDS.getConnection((connectingRDSError, connectingRDSResult) => {
                if(connectingRDSError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Connecting RDS fail',
                        contents : connectingRDSError
                    });

                    callback('Connecting RDS fail\n'+ connectingRDSError);
                } else {
                    callback(null, connectingRDSResult);
                }
            });
        },
        (connection, callback) => {
            let getUserEmailParameter = {
                userEmail : userDatas.email
            };
            let getUserEmailQuery = mybatis.mappingSQLStatement('users/accounts', 'sign_up', 'getUserEmail', getUserEmailParameter);
            
            connection.query(getUserEmailQuery, (getUserEmailQueryError, getUserEmailQueryResult) => {
                if(getUserEmailQueryError) {
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Email duplication check query fail',
                        contents : getUserEmailQueryError
                    });

                    callback('email duplication check query fail\n' + getUserEmailQueryError);
                } else if(getUserEmailQueryResult.length >= 1) {
                    connection.release();

                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Email is duplicated',
                        contents : 'Email is duplicated, other email is needed'
                    });

                    callback('Email is duplicated\nEmail is duplicated, other email is needed');
                } else {
                    callback(null, connection);
                }
            });
        },
        (connection, callback) => {
            encryption(userDatas.password, 'empty', (encryptionError, salt, encryptionResult) => {
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
            })
        },
        (connection, salt, hashedPassword, callback) => {
            let setUserDataParameter = {
                userEmail : userDatas.email,
                userPassword : hashedPassword,
                userSalt : salt,
                userName : userDatas.name,
                userPhoneNumber : userDatas.phoneNumber
            }
            let setUserDataQuery = mybatis.mappingSQLStatement('users/accounts', 'sign_up', 'setUserData', setUserDataParameter);

            connection.query(setUserDataQuery, (setUserDataQueryError, setUserDataQueryResult) => {
                connection.release();

                if(setUserDataQueryError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Sign up query fail',
                        contents : setUserDataQueryError
                    });

                    callback('Sign up query fail\n'+ setUserDataQueryError);
                } else {
                    res.status(201).send({
                        stat : 'Success',
                        title : 'Sign up success',
                        contents : 'Happy to your join!'
                    });

                    callback(null, 'Sign up success\nSign up task has all success');
                }
            })
        }
    ];

    async.waterfall(signUpTask, (asyncError, asyncResult) => {
        if(asyncError) console.log('Async Fail : Sign-up error\n' + asyncError);
        else console.log('Async Success : Sign-up success\n' + asyncResult);
    });
});

module.exports = router;