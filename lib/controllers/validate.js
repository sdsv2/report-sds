'use strict';

const config = require('../config.json');
const common = require('../common');

exports.smsParams = function (req, callback) {
  // body...
  try{
    if(!req.query.msisdn){
      let errMsg = 'sms report ignored: param msisdn unspecified';
      common.log(errMsg);
      callback('failed', errMsg);
      return;
    }else if(!req.query.ts){
      let errMsg = 'sms report ignored: param ts unspecified';
      common.log(errMsg);
      callback('failed', errMsg);
      return;
    }else if(!req.query.msg){
      let errMsg = 'sms report ignored: param msg unspecified';
      common.log(errMsg);
      callback('failed', errMsg);
      return;
    }else if(!req.query.smsc){
      let errMsg = 'sms report ignored: param smsc unspecified';
      common.log(errMsg);
      callback('failed', errMsg);
      return;
    }else{
      callback('','');
      return;
    }
  }catch(error){
    common.log("erorr validate sms "+error.message);
    callback('failed ',error.message);
    return;
  }
};


exports.ussdParams = function (req, callback) {
  // body...
  try{
    if(!req.params.status){
      let errMsg = 'ussd report ignored: param status unspecified';
      common.log(errMsg);
      callback('failed', errMsg);
      return;
    }else if(!req.params.info){
      let errMsg = 'ussd report ignored: param info unspecified';
      common.log(errMsg);
      callback('failed', errMsg);
      return;
    }else if(!req.params.modem){
      let errMsg = 'ussd report ignored: param modem unspecified';
      common.log(errMsg);
      callback('failed', errMsg);
      return;
    }else if(!req.params.ts){
      let errMsg = 'ussd report ignored: param ts unspecified';
      common.log(errMsg);
      callback('failed', errMsg);
      return;
    }else if(!req.params.timing){
      let errMsg = 'ussd report ignored: param timing unspecified';
      common.log(errMsg);
      callback('failed', errMsg);
      return;
    }else if(!req.params.timing2){
      let errMsg = 'ussd report ignored: param timing2 unspecified';
      common.log(errMsg);
      callback('failed', errMsg);
      return;
    }else if(!req.params.msisdn){
      let errMsg = 'ussd report ignored: param msisdn unspecified';
      common.log(errMsg);
      callback('failed', errMsg);
      return;
    }else{
      callback('','');
      return;
    }
  }catch(error){
    common.log("error validate sms "+error.message);
    callback('failed', error.message);
    return;
  }
};
