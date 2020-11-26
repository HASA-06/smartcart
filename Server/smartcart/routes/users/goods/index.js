const express = require('express');
const router = express.Router();

const addRouter = require('./add');
const deleteRouter = require('./delete');
const readRouter = require('./read');

router.use('/add', addRouter);
router.use('/delete', deleteRouter);
router.use('/read', readRouter);

router.get('/', (req, res) => {
    res.status(200).send({
        stat : "Success",
        msg : "URL /users/goods is connected"
    });
});

module.exports = router;