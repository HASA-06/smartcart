const express = require('express');
const router = express.Router();

const checkRouter = require('./check');
const createRouter = require('./create');
const readRouter = require('./read');
const updateRouter = require('./update');
const deleteRouter = require('./delete');

router.use('/check', checkRouter);
router.use('/create', createRouter);
router.use('/read', readRouter)
router.use('/update', updateRouter);
router.use('/delete', deleteRouter);

router.get('/', (req, res) => {
    res.status(200).send({
        stat : "Success",
        msg : "URL /admins/goods is connected"
    });
});

module.exports = router;