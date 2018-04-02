var express = require('express');
var router = express.Router();
var createSchedule = require('./createschedule');
var deleteSchedule = require('./deleteschedule');
var updateSchedule = require('./updateschedule');
var showSchedule = require('./showschedule');

router.use('/createschedule', createSchedule);
router.use('/deleteschedule', deleteSchedule);
router.use('/updateschedule', updateSchedule);
router.use('/showschedule', showSchedule);



module.exports = router;
