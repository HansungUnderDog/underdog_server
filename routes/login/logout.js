const express = require('express');
const router = express.Router();
const async = require('async');
const pool = require('../../config/dbpool');
const crypto = require('crypto');

var session = require('express-session');



router.get('/', (req, res) => {
console.log("asd");
  var object = [];
	var taskArray = [
		//1. connection을 pool로부터 가져옴		(callback)=> {
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
			req.session.destroy();
			if(req.session){
				res.status(500).send({
				stat : "1"
				});
				callback( "1");

			}else{
				res.status(201).send({
				stat : "success"

				});

				callback( "success logout" , null);
			}
		}
	];
	async.waterfall(taskArray, (err, result) => {
		if(err) console.log(err);
		else console.log(result);
	});
});

module.exports = router;
