'use strict';

const request = require('request');

const config = require('../config.json');
const common = require('../common');

const modelSms = require('../models/sms');

exports.index = async function () {
  // body...
  try{
    let records = [];
    await new Promise(function(resolve, reject) {
      modelSms.dataSms(1, function(err, data){
        if(err){
          //common.log("sms outbox "+data);
          return;
        }else{
          records = data;
          resolve();
        }
      });
    });
    //common.log("sms outbox send cp "+JSON.stringify(records));

    for(let i=0; i < records.length; i++){
      let user_id = records[i].user_id;
      let out_ts = records[i].out_tsSend;
      let site_id = 1;
      let site_url = null;

      if(records[i].member_id){
        await new Promise(function(resolve, reject) {
          modelSms.site(records[i].member_id, function(err, data){
            if(err){
              common.log("site "+data);
              return;
            }else{
              site_id = data[0].site_id;
              site_url = data[0].site_url;
              resolve();
            }
          })
        });
      }
      common.log("site id "+site_id);

      let smsc_id = null;
      let smsc_name = null;
      await new Promise(function(resolve, reject) {
        modelSms.smsc(site_id, 'sender', 'active', function(err, data){
          if(err){
            common.log("smsc "+data);
            return;
          }else{
            smsc_id = data[0].smsc_id;
            smsc_name = data[0].smsc_name;
            resolve();
          }
        })
      });
      common.log("smsc id "+smsc_id);
      common.log("smsc name "+smsc_name);

      //hit reply
      let url = site_url+'/sendsms?username=app1&password=1234&modem='+smsc_name+'&text='+records[i].out_msg+'&to='+records[i].username+'&ts='+out_ts;
      common.log("url "+url);
      let out_status = 'F';
      await new Promise(function(resolve, reject) {
        request(url, function(error, response, body){
          if(error){
            common.log("request cp "+error.message);
            resolve();
          }else{
            common.log("response: "+response && response.statusCode);
            out_status = 'S';
            resolve();
          }
        });
      });

      //update
      await new Promise(function(resolve, reject) {
        modelSms.updateOutbox(smsc_id, user_id, out_status, out_ts, function(err, data){
          if(!err){
            common.log("Update Outbox success - status "+out_status);
          }
        })
      });
    }
  }catch(error){
    common.log("catch smsoutbox "+error.message);
  }
};
