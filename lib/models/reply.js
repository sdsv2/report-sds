'use strict';

const connection = require('../db');
const common = require('../common');

exports.dataReply = function (needReply, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "SELECT *, IFNULL(rs_number, dest_msisdn) AS rs_numberMsisdn FROM topup INNER JOIN member USING(member_id) LEFT JOIN rs_chip USING (rs_id) LEFT JOIN stock_ref USING (stock_ref_id) LEFT JOIN transaction USING (trans_id) LEFT JOIN mutation USING (trans_id) LEFT JOIN topup_sms USING (topup_id) LEFT JOIN sms USING (sms_id) WHERE need_reply=?";
    connection.query(sql, [needReply], function(err, rows, fields){
      if(err){
        common.log("error reply "+err.message);
        throw err;
        return;
      }else{
        if(!rows[0]){
          callback('failed', 'no records for reply');
          resolve();
          return;
        }else{
          callback('', rows);
          resolve();
          return;
        }
      }
    });
  });
};

exports.insertOutbox = function (smsID, userID, smscID, errMsg, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "INSERT INTO sms_outbox (sms_id, user_id, out_ts, out_status, smsc_id, out_msg) VALUE(?, ?, NOW(), 'W', ?, ?)";
    connection.query(sql, [smsID, userID, smscID, errMsg], function(err, rows, fields){
      if(err){
        common.log("insert outbox "+err.message);
        throw err;
        return;
      }else{
        callback('', 'insert success');
        resolve();
        return;
      }
    })
  });
};

exports.insertOutboxRS = function (smsID, rsID, errMsg, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "INSERT INTO sms_outbox_rs (sms_id, rs_id, out_ts, out_status, out_msg) VALUE(?, ?, NOW(), 'W', ?)";
    connection.query(sql, [smsID, rsID, errMsg], function(err, rows, data){
      if(err){
        common.log("insert outbox rs "+err.message);
        throw err;
        return;
      }else{
        callback('', 'insert outbox rs success');
        resolve();
        return;
      }
    })
  });
};


exports.updateTopup = function (topupID, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "UPDATE topup SET need_reply=0 WHERE topup_id=?";
    connection.query(sql, [topupID], function(err, rows, fields){
      if(err){
        common.log("update topup "+err.message);
        throw err;
        return;
      }else{
        callback('', 'update topup success');
        resolve();
        return;
      }
    })
  });
};

exports.dataDeposit = function (needReply, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "SELECT * FROM deposit_web INNER JOIN user USING (user_id) INNER JOIN member USING (member_id) WHERE need_reply=?";
    connection.query(sql, [needReply], function(err, rows, fields){
      if(err){
        common.log("query deposit "+err.message);
        throw err;
        return;
      }else{
        callback('', rows);
        resolve();
        return;
      }
    });
  });
};

exports.updateDeposit = function (logID, needReply, ts, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "UPDATE deposit_web SET need_reply=? WHERE admin_log_id=?";
    if(ts){
      sql = "UPDATE deposit_web SET need_reply=?, out_ts=NOW() WHERE admin_log_id=?";
    }
    connection.query(sql, [needReply, logID], function(err, rows, data){
      if(err){
        common.log("Update deposit web "+err.message);
        throw err;
        return;
      }else{
        callback('','update success');
        resolve();
        return;
      }
    })
  });
};

exports.smsOutbox = function (userID, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "SELECT * FROM sms_outbox";
    //sampe sini
  });
};
