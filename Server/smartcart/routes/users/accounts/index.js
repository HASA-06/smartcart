const express = require('express');
const router = express.Router();

const signUpRouter = require('./sign_up');
const signInRouter = require('./sign_in');
const signOutRouter = require('./sign_out');

router.use('/sign-up', signUpRouter);
router.use('/sign-in', signInRouter);
router.use('/sign-out', signOutRouter);

router.get('/', (req, res)=> {
    res.status(200).send({
        stat: "Success",
        msg: "URL /users/accounts is connected"
    });
})

module.exports = router;