var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const pool = require('../../config/dbpool');
const async = require('async');
const crypto = require('crypto');
const date = require('date-utils');

console.log("createcomment")

router.post('/', (req,res) => {
	let article_id = req.body.article_id;
	let user_id = req.session.user_id;
	let comment_content = req.body.comment_content;
	let dt = new Date();
	let comment_written_time = dt.toFormat('YYYY-MM-DD HH24:MI:SS');
	let query = {
		insertQuery: 'INSERT INTO article_comment (article_id, user_id, comment_content, comment_written_time) VALUES (?, ?, ?, ?)',
		selectQuery: 'SELECT comment_id, article_id, main_community_type, nickname, comment_id, comment_content, comment_written_time, users.user_id '+
		'FROM article_comment INNER JOIN users ON article_comment.user_id=users.user_id WHERE (article_id = ? )',
		countQuery: 'UPDATE article_list SET coco_comment_count = coco_comment_count+1 WHERE crawling_article_id=?',
		selectIndex: 'SELECT comment_id, article_id, user_id, comment_content, comment_written_time FROM article_comment WHERE comment_id = ?'
	}
	console.log("fjfjfj");
	let taskArray = [
	(callback) =>{
		console.log(req.session.user_id);
		if(req.session.user_id){
			callback(null);
		}else{
			callback("0")
			res.status(500).send({
				stat : 0,
			});
		}
	},
	(callback) => {
		pool.getConnection((err, connection) => {
			if(err){
				res.status(500).send({
					stat: "fail"
				});
				connection.release();
				callback("DB connection err : ");
			}else{
				callback(null, connection);
			}
		});
	},
	(connection, callback) => {
		let insertQuery = query.insertQuery;
		connection.query(insertQuery, [article_id, user_id, comment_content, comment_written_time], (err, row) => {
			console.log(article_id);
			console.log(user_id);
			console.log(comment_content);
			console.log(comment_written_time);
			if(err){
				res.status(500).send({
					stat: "fail"
				});
				console.log(err);
				connection.release();
				callback("insert error");
			}else{
				callback(null, connection, row);
			}
		});
	},
	(connection, row, callback) => {
		let countQuery = query.countQuery;
		connection.query(countQuery, article_id, (err) => {
			if(err){
				connection.release();
				callback("comment count plus error", null);
			}else{
				callback(null, connection, row);
			}
		});
	},
	(connection, row, callback) => {
		let selectQuery = query.selectQuery;
		connection.query(selectQuery, article_id, (err, rows) => {
			console.log("여기" + row.insertId);
			if(err){
				res.status(401).send({
					stat: "select error"
				});
				connection.release();
				callback("select error", null);
			}else{
				let selectIndex = query.selectIndex;
				connection.query(selectIndex, row.insertId, (err, commentData) =>{
					if(err){
						console.log(err);
						res.status(401).send({
							stat:"error"
						});
						connection.release();
						callback("index error", null);
					}else{
						console.log(row.insertId);
						res.status(201).send({
							stat: "select success",
							data: {
								"comment_id" : commentData[0].comment_id,
								"article_id" : commentData[0].article_id,
								"user_id" : commentData[0].user_id,
								"comment_content" : commentData[0].comment_content,
								"comment_written_time" : commentData[0].comment_written_time
							},
							list: rows

						});
						connection.release();
						callback("list success", null);

					}
				});
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
