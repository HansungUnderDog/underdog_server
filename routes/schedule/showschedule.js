const express = require('express');
const router = express.Router();
const async = require('async');
const pool = require('../../config/dbpool');
const crypto = require('crypto');

console.log("showschedule");

router.get('/', (req, res) => {
console.log("asd");
  var schedule_id = req.param('schedule_id');
  var user_id = req.session.user_id;
	var taskArray = [
    (callback) =>{
  		console.log(req.session.user_id);
  		if(req.session.user_id){
  			callback(null);
  		}else{
  			callback("0");
  			res.status(500).send({
  				stat : 0,
  			});
  		}
  	},
    (callback) => {
			pool.getConnection((err, connection) => {
				if(err){
					res.status(500).send({
						stat : "fail"
					});
					callback("DB connection err : ");
				} else callback(null,connection);
			});
		},
    (connection, callback) => {
			var selectAtdQuery = 'SELECT schedule_id, type, app_person, place, content, date, cycle, user_id FROM schedule WHERE (schedule_id, user_id)=(?, ?)';
			connection.query(selectAtdQuery, [schedule_id, user_id], (err, rows) => {
				if(err){
					console.log(err);
					res.status(500).send({
						stat : "fail"
					});
					connection.release();
          callback("fail");
        } else{
          res.status(201).send({
            stat : "success",
            data : rows
          });
					connection.release();
          callback(null, "successful rows");
      }
			});
		}
	];
	async.waterfall(taskArray, (err, result) => {
		if(err) console.log(err);
		else console.log(result);
	});
});

module.exports = router;
