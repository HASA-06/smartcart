const express = require('express');
const router = express.Router();
const async = require('async');

const awsRDS = require('../../private_modules/database/aws_rds');
const mybatis = require('../../private_modules/database/mybatis');

router.get('/', (req, res, next)=> {
  let beaconTask = [
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
      let getBeaconDataParameter = {
        beaconId : req.query.beaconId
      };
  		let getBeaconDataQuery = mybatis.mappingSQLStatement('mobiles', 'beacon', 'getBeaconData', getBeaconDataParameter);

  		connection.query(getBeaconDataQuery, (getBeaconDataQueryError, getBeaconDataQueryResult) => {
  			connection.release();

  			if(getBeaconDataQueryError) {
  				res.status(500).send({
  					stat : 'Fail',
  					title : 'Get beacon data query fail',
  					contents : getBeaconDataQueryError
  				});

  				callback('Get beacon data query fail\n' + getBeaconDataQueryError);
  			} else {
  				res.status(200).send({
  					stat : 'Success',
  					title : 'Get beacon data success',
  					contents : 'Get beacon data task success',
  					data : getBeaconDataQueryResult
  				});

  				callback(null, 'Get beacon data success\nGet beacon data task success');
  			}
  		});
  	}
  ];

  async.waterfall(beaconTask, (asyncError, asyncResult) => {
		if(asyncError) console.log('Async fail : Beacon  task fail\n' + asyncError);
    else console.log('Async success : Beacon task success\n' + asyncResult);
  });
});

module.exports = router;