var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const pool = require('../../config/dbpool');

const async = require('async');
const crypto = require('crypto');

var session = require('express-session');

router.post('/', (req, res) => {
	let mail = req.body.email;
	let pwd = req.body.pwd;
	let query = {
		checkIdAndPassword: "SELECT user_id, pwd, nickname, salt, email FROM users WHERE email=?"
	};

	let taskArray = [

	(callback) =>{
		if(req.body.email && req.body.pwd){
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
			if(err) callback("connection error : " + err, null);
			else callback(null, connection);
		});
	},
	(connection, callback) => {
		let checkIdAndPassword = query.checkIdAndPassword;
		connection.query(checkIdAndPassword, mail, (err, userData) => {
			if(err){
				connection.release();
				res.status(501).send({
					stat: "mysql proc error : "
				});
				callback("mysql proc error ", null);
			}else{
				callback(null, userData);
			}
		});
	},
	(userData, callback) => {
		if(userData.length === 0){
			console.log(userData);
			res.status(501).send({
				stat: "login failll"
			});
			callback("login failll", null);
		}else{
			console.log("zzz" + userData[0]);
			callback(null, userData);
		}
	},
	(userData, callback) => {
		crypto.pbkdf2(pwd, userData[0].salt, 100000, 64, 'sha512', (err, hashed) => {
			if(err) callback("hashing error : ");
			else callback(null, userData, hashed.toString('base64'));
		});
	},
	(userData, hashed, callback) => {
		if(userData[0].pwd === hashed) {
			res.status(201).send({
				stat: "success",
        data: {
          "user_id":userData[0].user_id,
          "email":userData[0].email,
          "nickname":userData[0].nickname
        }
			});
    req.session.user_id = userData[0].user_id;
    console.log(req.session.user_id);
    req.session.save();
    callback("login success", null);
}else{
	res.status(501).send({
		stat: "login fail"
	});
	callback("login fail", null);
}
}
];
async.waterfall(taskArray, (err, result) => {
	if(err) console.log(err);
	else console.log(result);
});


});
router.post('/aa', (req, res) => {
	if(req.session.user_id){
		res.json("success");
	}else{
		res.json("fail");
	}
});



module.exports = router;
