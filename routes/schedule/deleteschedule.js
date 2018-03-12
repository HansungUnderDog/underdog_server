var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const pool = require('../../config/dbpool');
const async = require('async');
const crypto = require('crypto');
const date = require('date-utils');

console.log("deletecomment")

router.post('/', (req,res) => {
	let article_id = req.body.article_id
	let user_id = req.session.user_id;
	let comment_id = req.body.comment_id;
	let dt = new Date();
	let comment_written_time = dt.toFormat('YYYY-MM-DD HH24:MI:SS');
	let query = {
		checkQuery: 'SELECT article_id, user_id, comment_id FROM article_comment WHERE (article_id, user_id, comment_id) = (?, ?, ?)',
		deleteQuery: 'DELETE FROM article_comment WHERE (article_id, user_id, comment_id) = (?, ?, ?)',
		selectQuery: 'SELECT comment_id, article_id, main_community_type, nickname, comment_id, comment_content, comment_written_time, users.user_id ' +
		'FROM article_comment INNER JOIN users ON article_comment.user_id=users.user_id WHERE (article_id = ?)',
		countQuery: 'UPDATE article_list SET coco_comment_count = coco_comment_count-1 WHERE crawling_article_id=?'
	};
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
		console.log("hi");
		let checkQuery = query.checkQuery;
		console.log(checkQuery);
		connection.query(checkQuery, [article_id, user_id, comment_id], (err, userData) => {
			console.log("in");
			if(err){
				console.log(err);
				res.status(501).send({
					stat:"fail"
				});
				callback("chec err ");
				connection.release();
			}else if(userData.length===0){
				res.status(501).send({
					stat: "null error "
				});
				callback("null error");
				connection.release();
			}else{
				console.log("hi");
				callback(null, connection);
			}
		});
	},
	(connection, callback) => {
		let countQuery = query.countQuery;
		connection.query(countQuery, article_id, (err) => {
			if(err){
				res.status(501).send({
					stat: "null error "
				});
				connection.release();
				callback("comment count minus error");
			}else{
				callback(null, connection);
			}
		});
	},
	(connection, callback) => {
		let deleteQuery = query.deleteQuery;
		connection.query(deleteQuery, [article_id, user_id, comment_id], (err) => {
			console.log(user_id);
			console.log(comment_id);
			console.log(comment_written_time);
			if(err){
				res.status(401).send({
					stat: "delete error"
				});
				connection.release();
				callback("delete error");
			}else{
				let selectQuery = query.selectQuery;
				connection.query(selectQuery, article_id, (err, rows) => {
					if(err){
						console.log(err);
						res.status(401).send({
							stat:"error"
						});
						connection.release();
						callback("select error", null);
					}else{
						res.status(201).send({
							stat: "delete success",
							data: {
								"article_id" : article_id,
								"user_id" : user_id,
								"comment_id" : comment_id,
							},
							list: rows
						});
						connection.release();
						callback("delete success", null);
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
