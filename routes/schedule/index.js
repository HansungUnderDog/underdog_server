var express = require('express');
var router = express.Router();
var createSchedule = require('./createschedule');
var deleteSchedule = require('./deleteschedule');
var updateSchedule = require('./updateschedule');
var showSchedule = require('./showschedule');

router.use('/createschedule', createschedule);
router.use('/deleteschdule', deleteschedule);
router.use('/updateschedule', updateschedule);
router.use('/showschedule', showschedule);



module.exports = router;
