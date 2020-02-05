'use strict';

const connection = require('../db');
const common = require('../common');

exports.trx = function (transType, transRef, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "INSERT INTO transaction (trans_type, trans_ref, trans_date, trans_time) VALUE(?, ?, CURDATE(), CURTIME())";
    connection.query(sql, [transType, transRef], function(err, rows, fields){
      if(err){
        common.log("insert transaction "+err);
        throw err;
        return;
      }else{
        resolve();
        callback('',rows.insertId);
        return;
      }
    });
  });
};

exports.mutation = function (transId, amount, member, callback) {
  // body...
  let memberId = member[0].member_id;
  let old_balance = member[0].member_balance;
  let new_balance = old_balance + amount;

  return new Promise(function(resolve, reject) {
    let sql = "UPDATE member SET member_balance=? WHERE member_id=?";
    connection.query(sql, [new_balance, memberId], function(err, rows, fields){
      if(err){
        common.log("update member "+err);
        throw err;
        return;
      }
    });

    sql = "INSERT INTO mutation (trans_id, member_id, amount, balance) value(?, ?, ?, ?)";
    connection.query(sql, [transId, memberId, amount, new_balance], function(err, rows, fields){
      if(err){
        common.log("insert mutation "+err);
        throw err;
        return;
      }else{
        resolve();
        callback('','mutation has insert');
        return;
      }
    });
  });
};

exports.updateTopup = function (transId, topupStatus, needReply, errMsg, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "UPDATE topup SET topup_status=?, need_reply=?, error_msg=? WHERE trans_id=?";
    connection.query(sql, [topupStatus, needReply, errMsg, transId], function(err, rows, fields){
      if(err){
        common.log("update topup "+err);
        throw err;
        return;
      }else{
        resolve();
        callback('','');
        return;
      }
    });
  });
};
