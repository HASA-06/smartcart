const express = require('express');
const router = express.Router();

const signInRouter = require('./sign_in');
const registRouter = require('./regist');
const signOutRouter = require('./sign_out');
const deleteRouter = require('./delete');
const readRouter = require('./read');

router.use('/sign-in', signInRouter);
router.use('/regist', registRouter);
router.use('/sign-out', signOutRouter);
router.use('/delete', deleteRouter);
router.use('/read', readRouter);

router.get('/', (req, res) => {
    res.status(200).send({
        stat : "Success",
        msg : "URL /admins/accounts is connected"
    });
});

module.exports = router;