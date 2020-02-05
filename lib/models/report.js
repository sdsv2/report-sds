'use strict';

const connection = require('../db');
const common = require('../common');

exports.stockRef = function (smsc, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    common.log("query stock ref...");
    let sql = "SELECT * FROM stock_ref_type INNER JOIN sd_chip USING(ref_type_id) WHERE sd_name=?";
    connection.query(sql, [smsc], function(err, rows, fields){
      if(err){
        common.log("error stock ref type "+err);
        throw err;
        return;
      }else{
        common.log("query success");
        if(!rows[0]){
          common.log("empty callback");
          callback('failed', 'service report empty');
          resolve();
          return;
        }else{
          common.log("rows callback");
          common.log(rows[0].ref_type_name +" : "+rows[0].sd_number);
          resolve();
          callback('', rows);
          return;
        }
      }
    });
  });
};

exports.updateTopup = function (transId, logId, topupStatus, errMsg, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "UPDATE topup SET log_id=?, need_reply=?, topup_status=?, error_msg=? WHERE trans_id=?";
    connection.query(sql, [logId, 1, topupStatus, errMsg, transId], function(err, rows, fields){
      if(err){
        common.log("Update topup report "+err);
        throw err;
        return;
      }else{
        callback('','');
        resolve();
        return;
      }
    });
  });
};

exports.reversal = function (transId, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "SELECT * FROM topup INNER JOIN member USING (member_id) LEFT JOIN rs_chip USING(rs_id) LEFT JOIN sd_stock USING(sd_id, stock_ref_id) INNER JOIN mutation ON mutation.member_id = topup.member_id AND mutation.trans_id = topup.trans_id WHERE topup.trans_id=?";
    connection.query(sql, [transId], function(err, rows, fields){
      if(err){
        common.log("reversal query "+err);
        throw err;
        return;
      }else{
        if(!rows[0]){
          resolve();
          callback('failed','reversal: valid row not found');
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

exports.stockDenom = function (refTypeId, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "SELECT * FROM sd_stock INNER JOIN stock_ref USING(stock_ref_id) WHERE stock_ref.ref_type_id=? GROUP BY stock_ref.stock_ref_id";
    connection.query(sql, [refTypeId], function(err, rows, fields){
      if(err){
        common.log("stock denom "+err);
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

exports.insertStockDenom = function (transId, stockRefId, lastBalance, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "INSERT INTO stock_denom (trans_id, stock_ref_id, last_balance) value(?, ?, ?)";
    connection.query(sql, [transId, stockRefId, lastBalance], function(err, rows, fields){
      if(err){
        common.log("insert stock denom "+err);
        throw err;
        return;
      }else{
        callback('','');
        resolve();
        return;
      }
    });
  });
};
