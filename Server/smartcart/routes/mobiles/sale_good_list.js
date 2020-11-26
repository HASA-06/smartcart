const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../private_modules/database/aws_rds');
const mybatis = require('../../private_modules/database/mybatis');

router.get('/', (req, res, next)=> {
  let saleGoodListTask = [
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
  		let getSaleGoodsDatasQuery = mybatis.mappingSQLStatement('mobiles', 'sale_good_list', 'getSaleGoodsDatas', null);

  		connection.query(getSaleGoodsDatasQuery, (getSaleGoodsDatasQueryError, getSaleGoodsDatasQueryResult) => {
  			connection.release();

  			if(getSaleGoodsDatasQueryError) {
  				res.status(500).send({
  					stat : 'Fail',
  					title : 'Get sale goods datas query fail',
  					contents : getSaleGoodsDatasQueryError
  				});

  				callback('Get sale goods datas query fail\n' + getSaleGoodsDatasQueryError);
  			} else {
  				res.status(200).send({
  					stat : 'Success',
  					title : 'Get sale goods datas query success',
  					contents : 'Get sale goods datas task success',
  					data : getSaleGoodsDatasQueryResult
  				});

  				callback(null, 'Get sale goods datas query success\nGet sale goods datas task success');
  			}
  		});
  	}
  ];

  async.waterfall(saleGoodListTask, (asyncError, asyncResult) => {
		if(asyncError) console.log('Async fail : Sale good list task fail\n' + asyncError);
    else console.log('Async success : Sale good list task success\n' + asyncResult);
  });
});

module.exports = router;