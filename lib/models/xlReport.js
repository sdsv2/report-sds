'use strict';

const connection = require('../db');
const common = require('../common');

exports.dompul = function (rsNumber, topupQty, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "SELECT * FROM topup INNER JOIN rs_chip USING (rs_id) INNER JOIN sd_chip USING (sd_id) WHERE rs_number=? AND topup_qty=? AND topup_status in ('P','S') AND log_id IS NULL AND topup_ts > CURDATE()";
    connection.query(sql, [rsNumber, topupQty], function(err, rows, data){
      if(err){
        common.log("error report dompul "+err);
        throw err;
        return;
      }else{
        if(!rows[0]){
          resolve();
          common.log('dompul trans id');
          callback('failed', 'trans id not found');
          return;
        }else{
          callback('', rows);
          resolve();
          return;
        }
      }
    })
  });
};

exports.nominal = function (nominal, rsNumber, topupQty, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "SELECT * FROM topup INNER JOIN stock_ref USING (stock_ref_id) INNER JOIN rs_chip USING (rs_id) INNER JOIN sd_chip USING (sd_id) WHERE nominal=? AND rs_number=? AND topup_qty=? AND topup_status in ('P','S') AND log_id IS NULL AND topup_ts > CURDATE()";
    connection.query(sql, [nominal, rsNumber, topupQty], function(err, rows, fields){
      if(err){
        common.log("error report nominal "+err);
        throw err;
        return;
      }else{
        if(!rows[0]){
          resolve();
          common.log("nominal trans id");
          callback('failed', 'trans id not found');
          return;
        }else{
          resolve();
          callback('',rows);
          return;
        }
      }
    });
  });
};

exports.nominalFailed = function (nominal, rsNumber, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "SELECT * FROM topup INNER JOIN stock_ref USING (stock_ref_id) INNER JOIN rs_chip USING (rs_id) INNER JOIN sd_chip USING (sd_id) WHERE nominal=? AND rs_number=? AND topup_status in ('P','S') AND log_id IS NULL AND topup_ts > CURDATE()";
    connection.query(sql, [nominal, rsNumber], function(err, rows, fields){
      if(err){
        common.log("error report nominal "+err);
        throw err;
        return;
      }else{
        if(!rows[0]){
          resolve();
          common.log('nominal failed trans id');
          callback('failed', 'trans id not found');
          return;
        }else{
          resolve();
          callback('',rows);
          return;
        }
      }
    });
  });
};

exports.sdLog = function (dataSD, ts, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "SELECT * FROM sd_log WHERE sd_id=? AND orig_ts=?";
    connection.query(sql, [dataSD[0].sd_id, ts], function(err, rows, fields){
      if(err){
        common.log("query sd log "+err);
        throw err;
        return;
      }else{
        if(!rows[0]){
          resolve();
          callback('failed','sd log id not found');
          return;
        }else{
          resolve();
          callback('', rows);
          return;
        }
      }
    });
  });
};

exports.insertSdLog = function (dataSD, ts, msg, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "INSERT INTO sd_log (sd_id, orig_ts, local_ts, log_msg) VALUE(?, ?, NOW(), ?)";
    connection.query(sql, [dataSD[0].sd_id, ts, msg], function(err, rows, fields){
      if(err){
        common.log("insert sd log "+err);
        throw err;
        return;
      }else{
        callback('', rows.insertId);
        resolve();
        return;
      }
    });
  });
};
