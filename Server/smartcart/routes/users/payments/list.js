const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.status(200).send({
	  stat : "Success",
	  msg : "URL /users/payments is connected"
	});
});

module.exports = router;