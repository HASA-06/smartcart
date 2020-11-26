const express = require('express');
const router = express.Router();
const async = require('async');

const doRouter = require('./do');
const applyRouter = require('./apply');
const listRouter = require('./list');

router.use('/do', doRouter);
router.use('/apply', applyRouter);
router.use('/list', listRouter);

router.get('/', (req, res) => {
	res.status(200).send({
	  stat : "Success",
	  msg : "URL /users/payments is connected"
	});
});

module.exports = router;