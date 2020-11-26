const express = require('express');
const router = express.Router();

const accountsRouter = require('./accounts/index'); 
const tokensRouter = require('./tokens/index');
const goodsRouter = require('./goods/index');
const paymentsRouter = require('./payments/index');

router.use('/tokens', tokensRouter);
router.use('/accounts', accountsRouter);
router.use('/goods', goodsRouter);
router.use('/payments', paymentsRouter);

router.get('/', (req, res)=> {
    res.status(200).send({
        stat: "Success",
        msg: "URL /users is connected"
    });
})

module.exports = router;