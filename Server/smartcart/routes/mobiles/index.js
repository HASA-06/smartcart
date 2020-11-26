const express = require('express');
const router = express.Router();

const saleGoodListRouter = require('./sale_good_list');
const userDataRouter = require('./user_data');

router.use('/sale-good-list', saleGoodListRouter);
router.use('/user-data', userDataRouter);

router.get('/', (req, res, next)=> {
  res.status(200).send({
    stat: "Success",
    msg: "URL /mobiles is connected"
  });
});

module.exports = router;