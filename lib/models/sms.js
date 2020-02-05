'use strict';

const connection = require('../db');
const common = require('../common');

exports.dataSms = function (userID, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "SELECT *, concat('',out_ts) AS out_tsSend FROM sms_outbox INNER JOIN user USING (user_id) WHERE out_status=? AND user_id != ?";
    connection.query(sql, ['W',userID], function(err, rows, fields){
      if(err){
        common.log("sms data "+err.message);
        throw err;
        return;
      }else{
        if(!rows[0]){
          callback('failed', 'no data');
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

exports.site = function (memberID, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "SELECT * FROM site INNER JOIN member USING (site_id) WHERE member_id=?";
    connection.query(sql, [memberID], function(err, rows, fields){
      if(err){
        common.log("site "+err.message);
        throw err;
        return;
      }else{
        if(!rows[0]){
          callback('failed','no record');
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

exports.smsc = function (siteID, smscType, smscStatus, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    //let sql = "SELECT * FROM smsc WHERE smsc_status=? AND site_id=? AND smsc_type=? ORDER BY RAND() LIMIT 1";
    let sql = "SELECT * FROM smsc WHERE smsc_status=? AND smsc_type=? ORDER BY RAND() LIMIT 1";
    connection.query(sql, [smscStatus, smscType], function(err, rows, fields){
      if(err){
        common.log("smsc "+err.message);
        throw err;
        return;
      }else{
        if(!rows[0]){
          callback('failed','nothing smsc');
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

exports.updateOutbox = function (smscID, userID, outStatus, outTS, callback) {
  // body...
  return new Promise(function(resolve, reject) {
    let sql = "UPDATE sms_outbox SET smsc_id=?, out_status=? WHERE user_id=? AND out_ts=?";
    connection.query(sql, [smscID, outStatus, userID, outTS], function(err, rows, fields){
      if(err){
        common.log("update sms outbox "+err.message);
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
