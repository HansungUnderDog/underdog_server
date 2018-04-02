var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const pool = require('../../config/dbpool');
const async = require('async');
const crypto = require('crypto');

console.log("signup");

router.post('/', (req,res) => {
	let mail = req.body.email;
	let pwd = req.body.pwd;
	let nickname = req.body.nickname;
	let query = {
		userInsert: 'INSERT INTO users (email, pwd, salt, nickname) VALUES (?, ?, ?, ?)',
		duplicateCheckEmail: 'SELECT email FROM users WHERE email= ?',
		duplicateCheckNickName: 'SELECT nickname FROM users WHERE nickname=?',
		selectIndex: 'SELECT user_id, email, nickname FROM users WHERE user_id = ?'
	};
	console.log("fjfjfj");
	let taskArray = [
	(callback) => {
		if(req.body.email && req.body.pwd && req.body.nickname){
			callback(null);
		}else{
			res.status(501).send({
				stat: "fail"
			});
			callback("fail");
		}
	},
	(callback) => {
		pool.getConnection((err, connection) => {
			if(err){
				res.status(500).send({
					stat: "fail",
					masg: "DB connection fail"
				});
				connection.release();
				callback("DB connection err : " + err);
			}else{
				callback(null, connection);
			}
		});
	},
	(connection, callback) => {
		let duplicateCheckEmailQuery = query.duplicateCheckEmail;
		console.log(mail);
		connection.query(duplicateCheckEmailQuery, mail, (err, data) => {
			if(err){
				callback('check error' + err);
			}else if(data.length === 0){
				callback(null, connection);
			}else{
				res.status(401).send({
					msg: "email duplicate"
				});
				connection.release();
				callback("email duplicate", null);
			}
		});
	},
	(connection, callback) => {
		let duplicateCheckNickNameQuery = query.duplicateCheckNickName;
		console.log(mail);
		connection.query(duplicateCheckNickNameQuery, nickname, (err, data) => {
			if(err){
				callback('check error' + err);
			}else if(data.length === 0){
				callback(null, connection);
			}else{
				res.status(401).send({
					msg: "nickname duplicate"
				});
				connection.release();
				callback("nickname duplicate", null);
			}
		});
	},
	(connection, callback) => {
		let salt = crypto.randomBytes(32).toString('base64');
		crypto.pbkdf2(pwd, salt, 100000, 64, 'sha512', (err, hashed) => {
			if(err){
				callback("hashing err : ", null);
			}else{
				callback(null, connection, salt, hashed.toString('base64'));
			}
		});
	},
	(connection, salt, hashed, callback) => {
		let insertQuery = query.userInsert;
		connection.query(insertQuery, [mail, hashed, salt, nickname], (err, row) => {
			if(err){
				res.status(401).send({
					stat: "insert error"
				});
				connection.release();
				callback("insert error", null);
			}else{
				let selectIndex = query.selectIndex;
				connection.query(selectIndex, row.insertId, (err, userData)=>{
					if(err){
						console.log(err);
						res.status(401).send({
							stat: "error"
						});
						connection.release();
						callback("index error", null);
					}else{
						console.log(row.insertId);

						res.status(201).send({
							stat: "success",
							data: {
								"user_data":{
                  "user_id":row.insertId,
									"email":userData[0].email,
									"nickname":userData[0].nickname
								}
							}
						});
						req.session.user_id = userData[0].user_id;
						console.log("hi" + req.session.user_id);
						req.session.save();
						connection.release();
						callback("insert success", null);
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
