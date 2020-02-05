'use strict';

const config = require('../config.json');
const common = require('../common');

const modelReport = require('../models/report');
const modelTopup = require('../models/topup');

exports.index = async function (transId, callback) {
  // body...
  try{
    let records = [];
    await new Promise(function(resolve, reject) {
      common.log("get data reversal trans id "+transId);
      modelReport.reversal(transId, function(err, data){
        if(err){
          common.log(data);
          callback(err, data);
          resolve();
          return;
        }else{
          resolve();
          records = data;
        }
      });
    });

    let revTransId = 0;
    await new Promise(function(resolve, reject) {
      common.log("create table transaction reversal trans ref "+transId);
      modelTopup.trx('rev', transId, function(err, data){
        if(!err){
          resolve();
          revTransId = data;
        }
      });
    });

    await new Promise(function(resolve, reject) {
      common.log("create mutation from new trans id "+revTransId);
      modelTopup.mutation(revTransId, -records[0].amount, records, function(err, data){
        if(!err){
          resolve();
        }
      })
    });

    await new Promise(function(resolve, reject) {
      modelTopup.updateTopup(transId, 'R', 1, 'auto reversal', function(err, data){
        if(!err){
          common.log("trans id "+transId+" has reversal");
          resolve();
        }
      });
    });
    callback('', 'trans id '+transId+" has reversal");
    return;
  }catch(error){
    common.log("error "+error.message);
    callback('failed', error.message);
    return;
  }
};
