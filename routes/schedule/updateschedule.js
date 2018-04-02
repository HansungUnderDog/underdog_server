var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const pool = require('../../config/dbpool');
const async = require('async');
const crypto = require('crypto');
const date = require('date-utils');

router.post('/', (req, res) => {
  let user_id = req.session.user_id;
  let schedule_id = req.body.schedule_id;
  let type = req.body.type;
  let app_person = req.body.app_person;
  let place = req.body.place;
  let content = req.body.content;
  let dt = new Date();
  let date = dt.toFormat('YYYY-MM-DD HH24:MI:SS');
  let cycle = req.body.cycle;
  let query = {
    checkQuery: 'SELECT schedule_id, type, app_person, place, content, date, cycle, user_id FROM schedule WHERE (schedule_id, user_id) = (?, ?)',
    updateQuery: 'UPDATE schedule SET type=?, app_person=?, place=?, content=?, date=?, cycle=? WHERE (schedule_id, user_id) = (?, ?)'
  };
  let taskArray=[
    (callback) => {
      if(req.session.user_id){
        callback(null);
      }else{
        callback("0");
        res.status(500).send({
          stat : 0
        });
      }
    },
    (callback) => {
      pool.getConnection((err, connection) => {
        if(err){
          res.status(500).send({
            stat : "fail"
          });
          connection.release();
          callback("DB connection err : ");
        }else{
          callback(null, connection);
        }
      });
    },
    (connection, callback) => {
      let checkQuery = query.checkQuery;
      connection.query(checkQuery, [schedule_id, user_id], (err, row) => {
        if(err){
          console.log(schedule_id);
          res.status(500).send({
            stat:"check fail"
          });
          connection.release();
          callback("check error");
        }else if(row.length===0){
  				res.status(501).send({
  					stat: "null error "
  				});
  				callback("null error");
  				connection.release();
        }
        else{
          console.log(schedule_id);
          callback(null, connection, row);
        }
      });
    },
    (connection, row, callback) => {
      let updateQuery = query.updateQuery;
      connection.query(updateQuery, [type, app_person, place, content, date, cycle, schedule_id, user_id], (err,rows) => {
        if(err){
          console.log(err);
          res.status(500).send({
            stat:"update error"
          });
          connection.release();
          callback("update error");
        }else{
          let selectQuery = query.checkQuery;
          connection.query(selectQuery, [schedule_id, user_id], (err, scheduleData) => {
            res.status(201).send({
              stat:"update success",
              data:{
                "schedule_id" : scheduleData[0].schedule_id,
                "type" : scheduleData[0].type,
                "app_person" : scheduleData[0].app_person,
                "place" : scheduleData[0].place,
                "content" : scheduleData[0].content,
                "date" : scheduleData[0].date,
                "cycle" : scheduleData[0].cycle,
                "user_id" : scheduleData[0].user_id
              }
            });
            connection.release();
            callback("update success");
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