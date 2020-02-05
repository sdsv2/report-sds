'use strict';

const config = require('../config.json');
const common = require('../common');

const reversalControl = require('./reversal');

const modelXlReport = require('../models/xlReport');
const modelReport = require('../models/report');

exports.index = function (req, dataSD, callback) {
  // body...
  try{
    callback('failed', 'no parsing ussd for xl and indosat');
    return;
  }catch(error){
    common.log("error xl ussd "+error.message);
    callback('failed', error.message);
    return;
  }
};
