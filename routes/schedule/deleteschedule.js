var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const pool = require('../../config/dbpool');
const async = require('async');
const crypto = require('crypto');

console.log("deletecomment");

router.post('/', (req,res) => {
	let schedule_id = req.body.schedule_id;
	let user_id = req.session.user_id;
	let query = {
		checkQuery: 'SELECT schedule_id, user_id FROM schedule WHERE (schedule_id, user_id) = (?, ?)',
		deleteQuery: 'DELETE FROM schedule WHERE (schedule_id, user_id) = (?, ?)'
	};
	console.log("fjfjfj");
	let taskArray = [
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
		connection.query(checkQuery, [schedule_id, user_id], (err, userData) => {
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
				callback(null, connection, userData);
			}
		});
	},
	(connection, userData, callback) => {
		let deleteQuery = query.deleteQuery;
		connection.query(deleteQuery, [schedule_id, user_id], (err, row) => {
			if(err){
				res.status(401).send({
					stat: "delete error"
				});
				connection.release();
				callback("delete error");
			}else{
						res.status(201).send({
							stat: "delete success",
							data: {
								"schedule_id" : userData[0].schedule_id,
								"user_id" : userData[0].user_id
							}
						});
						connection.release();
						callback("delete success", null);
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
