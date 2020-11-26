const mysql = require('mysql');
const awsRDSConfig = require('../../configs/database/aws_rds.json');

module.exports = mysql.createPool(awsRDSConfig);