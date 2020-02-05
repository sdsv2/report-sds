'use strict';

const config = require('../config.json');
const common = require('../common');

const modelReply = require('../models/reply');

exports.index = async function () {
  // body...
  try{
    let records = [];
    await new Promise(function(resolve, reject) {
      modelReply.dataReply(1, function(err, data){
        if(err){
          //common.log(data);
          return;
        }else{
          records = data;
          resolve();
        }
      });
    });

    for(let i=0; i < records.length; i++){
      setTimeout( async () => {
        common.log("records need reply "+JSON.stringify(records[i]));
        let topup_id = records[i].topup_id;
        let topup_status = records[i].topup_status;
        let sms_id = records[i].sms_id;
        let user_id = records[i].user_id;
        let smsc_id = records[i].smsc_id;
        let sms_time = records[i].sms_time;
        let sms_localtime = records[i].sms_localtime;
        if(sms_id){
          if(topup_status == 'D'){
            await new Promise(function(resolve, reject) {
              let outMsg = 'Maaf, '+records[i].error_msg;
              modelReply.insertOutbox(sms_id, user_id, smsc_id, outMsg, function(err, data){
                if(!err){
                  resolve();
                }
              });
            });
          }
          //status R
          if(topup_status == 'R'){
            await new Promise(function(resolve, reject) {
              let outMsg = 'Gagal, isi '+records[i].stock_ref_name+' sebanyak '+records[i].topup_qty+' ke '+records[i].rs_numberMsisdn+'. saldo: '+records[i].member_balance;
              modelReply.insertOutbox(sms_id, user_id, null, outMsg, function(err, data){
                if(!err){
                  resolve();
                }
              });
            });

            await new Promise(function(resolve, reject) {
              let outMsg = 'Gagal, isi '+records[i].stock_ref_name+' sebanyak '+records[i].topup_qty+' ke '+records[i].rs_numberMsisdn;
              modelReply.insertOutboxRS(sms_id, records[i].rs_id, outMsg, function(err, data){
                if(!err){
                  resolve();
                }
              });
            });
          }
          //status S
          if(topup_status == 'S'){
            let rsNumber = records[i].rs_numberMsisdn;
            let stockRefName = records[i].stock_ref_name;
            let topupQty = records[i].topup_qty;
            let amount = records[i].amount;
            //amount = amount.replace(/\.000$/,'');
            common.log("amount "+amount);
            await new Promise(function(resolve, reject) {
              let outMsg = 'Transaksi Anda ke nomor '+rsNumber+' sebesar '+stockRefName+'='+topupQty+' total '+amount+' telah berhasil diproses';
              modelReply.insertOutbox(sms_id, user_id, null, outMsg, function(err, data){
                if(!err){
                  resolve();
                }
              })
            });
          }
        }
      }, 1000);
      //update topup
      await new Promise(function(resolve, reject) {
        modelReply.updateTopup(topup_id, function(err,data){
          if(!err){
            common.log("need reply "+data);
            resolve();
          }
        });
      });
    }
  }catch(error){
    common.log("error report "+error.message);
  }
};
