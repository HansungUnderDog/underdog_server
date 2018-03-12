var express = require('express');
var router = express.Router();
var signin = require('./signin');
var signup = require('./signup');
var signconfig = require('./signconfig');
var nickconfig = require('./nickconfig');
var logout = require('./logout');

router.use('/signin', signin);
router.use('/signup', signup);
router.use('/signconfig', signconfig);
router.use('/nickconfig', nickconfig);
router.use('/logout', logout);


module.exports = router;
