const express = require('express');
const router = express.Router();
const async = require('async');
const pool = require('../../config/dbpool');
const crypto = require('crypto');

console.log("showschedule");

router.get('/', (req, res) => {
console.log("asd");
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
        let selectAllScheduleQuery = 'SELECT schedule_id, types, app_person, place, content, dates, cycle, user_id FROM schedule WHERE user_id = ?';
        connection.query(selectAllScheduleQuery, user_id, (err, rows) => {
          if(err){
            console.log(err);
            res.status(501).send({
              stat: "select error"
            });
          }else{
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
