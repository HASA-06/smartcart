const express = require('express');
const router = express.Router();

const accountsRouter = require('./accounts/index');
const goodsRouter = require('./goods/index');
const tokensRouter = require('./tokens/index');

router.use('/accounts', accountsRouter);
router.use('/goods', goodsRouter);
router.use('/tokens', tokensRouter);

router.get('/', (req, res) => {
    res.status(200).send({
        stat : "Success",
        msg : "URL /admins is connected"
    });
});

module.exports = router;