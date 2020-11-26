const express = require('express');
const router = express.Router();
const async = require('async');

const jsonWebToken = require('../../../private_modules/json_web_token');
const validity = require('../../../private_modules/validity/token');
const awsRDS = require('../../../private_modules/database/aws_rds');
const mybatis = require('../../../private_modules/database/mybatis');

router.get('/', (req, res) => {
    res.status(200).send({
        stat: 'Success',
        msg: 'URL /admins/tokens/issue is connected'
    });
});

router.post('/', (req, res) => {
    let adminToken = req.headers.token;

    let reIssueTask = [
        (callback) => {
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
            let getAdminIdParameter = {
                adminJWTToken : adminToken
            };
            let getAdminIdQuery = mybatis.mappingSQLStatement('admins/tokens', 'reissue', 'getAdminId', getAdminIdParameter);
            
            connection.query(getAdminIdQuery, (getAdminIdQueryError, getAdminIdQueryResult) => {
                if(getAdminIdQueryError) {
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Get admin id query fail',
                        contents : getAdminIdQueryError
                    });

                    callback('Get admin id query fail\n' + getAdminIdQueryError);
                } else if(getAdminIdQueryResult.length == 0) {
                    connection.release();

                    res.status(400).send({
                        stat : 'Fail',
                        title : 'Get admin id query fail',
                        contents: 'No admin with token value'
                    });

                    callback('Get admin id query fail\nNo admin with token value');
                } else {
                    callback(null, connection, getAdminIdQueryResult[0].id);
                }
            });
        },
        (connection, adminId, callback) => {
            jsonWebToken.createToken(adminId, (createTokenError, createTokenResult) => {
                if(createTokenError) {
                    connection.release();

                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Create token fail',
                        contents: createTokenError
                    });

                    callback('Create token fail\n' + createTokenError)
                } else {
                    callback(null, connection, adminId, createTokenResult);
                }
            });
        },
        (connection, adminId, adminToken, callback) => {
            let setAdminTokenParameter = {
                id : adminId,
                adminJWTToken : adminToken
            };
            let setAdminTokenQuery = mybatis.mappingSQLStatement('admins/tokens', 'reissue', 'setAdminToken', setAdminTokenParameter);

            connection.query(setAdminTokenQuery, (setAdminTokenQueryError, setAdminTokenQueryResult) => {
                connection.release();
                
                if(setAdminTokenQueryError) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Set admin token query fail',
                        contents : setAdminTokenQueryError
                    });

                    callback('Set admin token query fail\n' + setAdminTokenQueryError);
                } else if(setAdminTokenQueryResult.affectedRows != 1) {
                    res.status(500).send({
                        stat : 'Fail',
                        title : 'Set admin token query fail',
                        contents : 'Not updated admin token, please ask to server admin'
                    });

                    callback('Set admin token query fail\nNot updated admin token, please ask to server admin');
                } else {
                    res.status(201).send({
                        stat : 'Success',
                        title : 'Reissue admin token success',
                        contents : 'New admin token is saved',
                        data : adminToken
                    });

                    callback(null, 'Reissue admin token success\nNew admin token is saved');
                }
            });
        }
    ];

    async.waterfall(reIssueTask, (asyncError, asyncResult) => {
        if(asyncError) console.log('Async fail : Reissue token fail\n' + asyncError);
        else console.log('Async Success : Reissue token success\n' + asyncResult);
    })
});

module.exports = router;