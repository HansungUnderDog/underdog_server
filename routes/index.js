var express = require('express');
var router = express.Router();
var login = require('./login/index');
var schedule = require('./schedule/index');

router.use('/schedule', schedule);
router.use('/login', login);


module.exports = router;
