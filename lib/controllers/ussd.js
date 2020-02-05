'use strict';

const config = require('../config.json');
const common = require('../common');

const validateControl = require('./validate');

const modelReport = require('../models/report');
const xlControl = require('./xlUssd');
const indosatControl = require('./indosatUssd');

exports.index = async function (req, res, next) {
  // body...
  try{
    await new Promise(function(resolve, reject) {
      common.log("searching data...")
      validateControl.ussdParams(req, function(err, data){
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
      common.log("stock Ref...");
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
    common.log("records "+JSON.stringify(records));
    common.log("count records "+records.length);
    common.log("next...")

    if(records.length > 0){
      common.log("report ussd length "+records.length);
      if(records[0].ref_type_id == 1){
        common.log("report ussd xl");
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
        common.log("report ussd indosat");
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
    common.log("ussd error "+error.message);
    res.json({status: 'failed', message: error.message});
    return;
  }
};
