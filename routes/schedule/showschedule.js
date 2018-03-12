const express = require('express');
const router = express.Router();
const async = require('async');
const pool = require('../../config/dbpool');
const crypto = require('crypto');

console.log("showschedule");

router.get('/', (req, res) => {
console.log("asd");
  var test = req.param('article_id');
  console.log(test);
  var object = [];
	var taskArray = [
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
			var selectAtdQuery = 'SELECT comment_id, article_id, main_community_type, nickname, comment_id, comment_content, comment_written_time, users.user_id '+
				'FROM article_comment INNER JOIN users ON article_comment.user_id=users.user_id WHERE (article_id = ? )';
			connection.query(selectAtdQuery, test, (err, rows) => {
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
