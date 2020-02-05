'use strict';

const config = require('../config.json');
const common = require('../common');

const validateControl = require('./validate');

const modelReport = require('../models/report');
const xlControl = require('./xlSms');
const indosatControl = require('./indosatSms');

exports.index = async function (req, res, next) {
  // body...
  try{
    await new Promise(function(resolve, reject) {
      common.log("searching data report...")
      validateControl.smsParams(req, function(err, data){
        if(err){
          res.json({status: 'failed', message: data});
          return;
        }else{
          resolve();
        }
      });
    });

    let records = []
    await new Promise(function(resolve, reject) {
      common.log("stock Ref report...");
      modelReport.stockRef(req.query.smsc, function(err, data){
        if(err){
          res.json({status: 'failed', message: data});
          return;
        }else{
          records = data;
          common.log("call back "+data[0].sd_name);
          resolve();
        }
      });
    });
    common.log("records report "+JSON.stringify(records));
    common.log("count records report "+records.length);
    common.log("report next...")

    if(records.length > 0){
      common.log("report length "+records.length);
      if(records[0].ref_type_id == 1){
        common.log("report xl");
        await new Promise(function(resolve, reject) {
          xlControl.index(req, records, function(err, data){
            if(err){
              res.json({status: err, message: data});
              return;
            }else{
              res.json({status: 'success', message: 'report has parsing'});
              return;
            }
          });
        });
      }else if(records[0].ref_type_id == 3){
        common.log("report indosat");
        await new Promise(function(resolve, reject) {
          indosatControl.index(req, records, function(err, data){
            if(err){
              res.json({status: err, message: data});
              return;
            }else{
              res.json({status: 'success', message: 'report has parsing'});
              return;
            }
          });
        });
      }
    }else{
      res.json({status:'failed', message: 'no data record'});
      return;
    }
  }catch(error){
    common.log("sms error "+error.message);
    res.json({status: 'failed', message: error.message});
    return;
  }
};
