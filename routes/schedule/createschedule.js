var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const pool = require('../../config/dbpool');
const async = require('async');
const crypto = require('crypto');
var moment = require('moment');

router.post('/', (req,res) => {
	let user_id = req.session.user_id;
	let types = req.body.types;
	let app_person = req.body.app_person;
	let place = req.body.place;
	let content = req.body.content;
	let dates = moment().toDate();
	let cycle = req.body.cycle;
	let query = {
		insertQuery: 'INSERT INTO schedule (types, app_person, place, content, dates, cycle, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
		selectQuery: 'SELECT schedule_id, types, app_person, place, content, dates, cycle, user_id FROM schedule WHERE schedule_id=?'
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
		let insertQuery = query.insertQuery;
		connection.query(insertQuery, [types, app_person, place, content, dates, cycle, user_id], (err, row) => {
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
		let selectQuery = query.selectQuery;
		connection.query(selectQuery, row.insertId, (err, rows) => {
			console.log("여기" + row.insertId);
			if(err){
				res.status(401).send({
					stat: "select error"
				});
				connection.release();
				callback("select error", null);
			}else{
					res.status(201).send({
						stat: "select success",
						data: {
							"schedule_id" : row.insertId,
							"types" : rows[0].types,
							"app_person" : rows[0].app_person,
							"place" : rows[0].place,
							"content" : rows[0].content,
							"dates" : rows[0].dates,
							"cycle" : rows[0].cycle,
							"user_id" : rows[0].user_id
						}
					});
					connection.release();
					callback("select success");
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
