const express = require('express');
const router = express.Router();

const usersRouter = require('./users/index');
const adminsRouter = require('./admins/index');
const mobilesRouter = require('./mobiles/index');

router.use('/users', usersRouter);
router.use('/admins', adminsRouter);
router.use('/mobiles', mobilesRouter);

router.get('/', (req, res, next)=> {
  res.status(200).send({
    stat: "Success",
    msg: "URL / is connected"
  });
});

module.exports = router;
