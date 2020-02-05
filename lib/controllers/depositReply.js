'use strict';

const config = require('../config.json');
const common = require('../common');

const modelReply = require('../models/reply');

exports.index = async function () {
  // body...
  try{
    let records = [];
    await new Promise(function(resolve, reject) {
      modelReply.dataDeposit(1, function(err, data){
        if(err){
          common.log(data);
          return;
        }else{
          records = data;
          resolve();
        }
      });
    });

    for(let i=0; i < records.length; i++){
      let log_id = records[i].admin_log_id;
      if(records[0].dep_status == 'D'){
        await new Promise(function(resolve, reject) {
          modelReply.updateDeposit(log_id, 0, 0, function(err, data){
            if(!err){
              return;
            }
          });
        });
      }

      await new Promise(function(resolve, reject) {
        let outMsg = 'Telah ditambahkan deposit Anda sebesar '+records[i].dep_amount+'. saldo: '+records[i].member_balance;
        modelReply.insertOutbox(null, records[i].user_id, null, outMsg, function(err, data){
          if(!err){
            resolve();
          }
        });
      });

      await new Promise(function(resolve, reject) {
        modelReply.updateDeposit(log_id, 0, 1, function(err, data){
          if(!err){
            resolve();
          }
        });
      });
    }
  }catch(error){
    common.log("deposit need reply "+error.message);
  }
};
