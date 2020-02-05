'use strict';

const config = require('../config.json');
const common = require('../common');
const connection = require("../db");

const reversalControl = require('./reversal');

const modelIndosatReport = require('../models/indosatReport');
const modelReport = require('../models/report');

exports.index = async function (req, dataSD, callback) {
  // body...
  try{
    let text = req.query.msg;
    common.log("report indosat sms "+text);
    //Ref:211049719.TRS 556V5 pada 02/04 15:12 ke 085811323691 SUKSES.Stok anda 0,90550,0,41050,0,0,4250,0,3070,540
    //Ref:338804665.TRS 1V5 pada 16/04 16:45 ke 081559815829 SUKSES.Stok anda 0,73332,0,46465,0,0,3975,0,1737,256
    //Anda telah alokasi Rp 1,000.00 pada 31/07/19 09:29 ke 17003643 SUKSES, Saldo:Rp 2,651,946,054.50, TID:01672700009393947367.
    let regex = 'SUKSES';
    let resText = text.match(regex);
    let regexAlokasi = 'alokasi';
    let resAlokasi = text.match(regexAlokasi);

    let transId = null;
    let new_status = 'P';
    let payment_gateway = null;
    let nominal = 0; let topupQty = 0; let rsNumber = null;
    let stockReport = [];
    let sdID = null;
    if(resText && resAlokasi){
      topupQty = text.match(/Rp ([^"]+)pada/)[1];
      let rs_outlet_id = text.match(/ke (\d+) SUKSES/)[1];
      await new Promise(function(resolve, reject) {
        modelIndosatReport.rsChipByRsOutletId(rs_outlet_id, function(err,data){
          if(err){
            callback('failed', data);
            return;
          }else{
            rsNumber = data[0].rs_number;
            resolve();
          }
        });
      });
      let saldo = text.match(/Saldo:Rp ([^"]+), TID/)[1];
      saldo = saldo.replace(/,/g,"");
      common.log("saldo reply "+saldo);
      stockReport.push(saldo);//indosat nominal IDN
      new_status = 'S';
    }else if(resText){
      let parseReport = text.match(/TRS ([^"]+)V(\d+) pada/);
      nominal = parseReport[2];
      topupQty = parseReport[1];
      rsNumber = text.match(/ke (\d+) SUKSES/)[1];
      if(nominal){
        nominal = nominal * 1000;
      }

      let stock = match(/Stok\sanda\s([^!]+)\./)[1];
      let arrStock = stock.split(/,/);
      for(let i=0; i < arrStock.length; i++){
        stockReport.push(arrStock[1]);//indosat 5K
        stockReport.push(arrStock[3]);//indosat 10K
        stockReport.push(arrStock[6]);//indosat 25K
        stockReport.push(arrStock[8]);//indosat 50K
        stockReport.push(arrStock[9]);//indosat 100K
      }
      new_status = 'S';
    }
    topupQty = topupQty.replace(/,/,'');
    common.log("nominal ="+nominal+", topup qty ="+topupQty+", rs number ="+rsNumber);

    await new Promise(function(resolve, reject) {
      modelIndosatReport.nominal(nominal, rsNumber, topupQty, function(err, data){
        if(err){
          callback('failed', data);
          return;
        }else{
          transId = data[0].trans_id;
          sdID = data[0].sd_id;
          resolve();
        }
      });
    });
    common.log("trans id "+transId);

    //begin transaction
    await new Promise(function(resolve, reject) {
      connection.beginTransaction(async function(err){
        if(err){
          common.log("begin "+err.message);
          callback('failed', err.message);
          return;
        }else{
          resolve();
        }
      });
    });

    //search sd log
    let log_id = null;
    await new Promise(function(resolve, reject) {
      modelIndosatReport.sdLog(dataSD, req.query.ts, function(err, data){
        if(err){
          common.log(data);
          modelIndosatReport.insertSdLog(dataSD, req.query.ts, req.query.msg, function(err,data){
            if(err){
              connection.rollback(function(){
                common.log("rollback "+data);
              });
              callback('failed', data);
              return;
            }else{
              log_id = data;
              resolve();
            }
          });
        }else{
          resolve();
          log_id = data[0].log_id;
        }
      });
    });

    //update
    await new Promise(function(resolve, reject) {
      let err_msg = 'topup gagal';
      if(new_status == 'S'){
        err_msg = 'topup berhasil';
      }
      modelReport.updateTopup(transId, log_id, new_status, err_msg, function(err, data){
        if(err){
          connection.rollback(function(){
            common.log("rollback "+data);
          });
          callback('failed', data);
        }else{
          resolve();
        }
      });
    });

    //stock denom
    let denomRecords = [];
    if(stockReport.length > 0){
      await new Promise(function(resolve, reject) {
        modelReport.stockDenom(3, function(err, data){
          if(err){
            connection.rollback(function(){
              common.log("rollback "+data);
            });
            callback('failed', data);
          }else{
            resolve();
            denomRecords = data;
          }
        });
      });
    }
    if(denomRecords.length > 0){
      for(let i = 0; i < denomRecords.length; i++){
        let refId = denomRecords[i].stock_ref_id;
        let lastBalance = stockReport[i] || 0;
        common.log('ref id :'+refId+' value '+i+': '+lastBalance);
        await new Promise(function(resolve, reject) {
          modelReport.insertStockDenom(transId, refId, lastBalance, function(err, data){
            if(!err){
              resolve();
            }
          })
        });
      }
    }
    //commit
    await new Promise(function(resolve, reject) {
      connection.commit(function(err){
        if(err){
          connection.rollback(function(){
            common.log("commit error "+err.message);
            callback('failed', err.message);
          });
        }else{
          resolve();
        }
      })
    });
    callback('','report has parsing');
    return;
  }catch(error){
    common.log("error report sms "+error.message);
    callback('failed', error.message);
    return;
  }
};
