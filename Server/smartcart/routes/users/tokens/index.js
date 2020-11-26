const express = require('express');
const router = express.Router();

const checkRouter = require('./check');
const reIssueRouter = require('./reissue');

router.use('/check', checkRouter);
router.use('/reissue', reIssueRouter);

router.get('/', (req, res) => {
    res.status(200).send({
        stat : "Success",
        msg : "URL /users/tokens is connected"
    });
});

module.exports = router;