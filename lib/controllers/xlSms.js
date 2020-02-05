'use strict';

const config = require('../config.json');
const common = require('../common');

const reversalControl = require('./reversal');

const modelXlReport = require('../models/xlReport');
const modelReport = require('../models/report');

exports.index = async function (req, dataSD, callback) {
  // body...
  try{
    let text = req.query.msg;
    common.log("report xl sms "+text);

    let regex = 'Maaf, Transaksi Nominal';
    let resText = text.match(regex);

    let transId = null;
    let new_status = null;
    let payment_gateway = null;
    if(!resText){
      //dompul
      let regDompul = 'Dompul';
      let resDompul = text.match(regDompul);
      if(resDompul){
        //Transaksi Dompul ke 6287794492475 sebanyak 200000 dgn trx id 266387166 berhasil. Sisa Dompul Anda saat ini Rp.54623200
        let parseReport = text.match(/Dompul ke (\d+) sebanyak (\d+) dgn trx id (\d+) berhasil. Sisa Dompul Anda saat ini Rp.(\d+)/);
        let rsNumber = parseReport[1];
        let topupQty = parseReport[2];
        let trxReport = parseReport[3];
        let saldoDompul = parseReport[4];
        await new Promise(function(resolve, reject) {
          common.log("rs number "+rsNumber);
          common.log("topup qty "+topupQty);
          modelXlReport.dompul(rsNumber, topupQty, function(err, data){
            if(err){
              callback('failed', data);
              return;
            }else{
              transId = data[0].trans_id;
              resolve();
            }
          });
        });
      }
      //nominal
      let regNominal = 'Nominal';
      let resNominal = text.match(regNominal);
      if(resNominal){
        //Transaksi Nominal 10000 ke 6281959107975 sebanyak 10 unit dgn trx id 266387133 berhasil. Sisa nominal 10000 Anda saat ini 1475 unit.
        let parseReport = text.match(/Nominal (\d+) ke (\d+) sebanyak (\d+) unit dgn trx id (\d+) berhasil. Sisa nominal (\d+) Anda saat ini (\d+) unit/);
        let nominal = parseReport[1];
        let rsNumber = parseReport[2];
        let topupQty = parseReport[3];
        let trxReport = parseReport[4];
        let saldoNominal = parseReport[6];
        await new Promise(function(resolve, reject) {
          common.log("rs number "+rsNumber);
          common.log("topup qty "+topupQty);
          common.log("nominal "+nominal);
          modelXlReport.nominal(nominal, rsNumber, topupQty, function(err, data){
            if(err){
              callback('failed', data);
              return;
            }else{
              transId = data[0].trans_id;
              resolve();
            }
          });
        });
      }
      new_status='S';
    }
    regex = 'gagal';
    resText = text.match(regex);
    if(resText){
      //dompul
      let regDompul = 'Dompul';
      let resDompul = text.match(regDompul);
      if(resDompul){
        //Maaf Transaksi Dompul ke 6285923641198 gagal. Terjadi kegagalan fungsional.
        //Maaf Transaksi Dompul ke 6287768972499 gagal. Minimal transaksi Dompul adalah Rp 10000
        //Maaf Transaksi Dompul ke 6281906399174 gagal. Nomor Penerima tidak terdaftar.
        callback('failed','Dompul gagal - tidak terparsing');
        return;
      }
      //nominal
      let regNominal = 'Nominal';
      let resNominal = text.match(regNominal);
      if(resNominal){
        //Maaf Transaksi Nominal  10000 ke 6287869366573 gagal.  Nominal diluar profil yang Anda atau penerima miliki. Untuk transaksi diluar profil gunakan TRNSF
        //Maaf Transaksi Nominal 10000 ke 6287869366542 gagal. Transfer dompet tidak diperbolehkan.
        let parseReport = text.match(/Nominal (\d+) ke (\d+) gagal/);
        let nominal = parseReport[1];
        let rsNumber = parseReport[2];
        await new Promise(function(resolve, reject) {
          common.log("rs number gagal "+rsNumber);
          modelXlReport.nominalFailed(nominal, rsNumber, function(err, data){
            if(err){
              callback('failed', data);
              return;
            }else{
              transId = data[0].trans_id;
              resolve();
            }
          });
        });
      }
      new_status = 'R';
      if(payment_gateway != 0){
        new_status = 'F';
      }
    }

    //search sd log
    let log_id = null;
    await new Promise(function(resolve, reject) {
      modelXlReport.sdLog(dataSD, req.query.ts, function(err, data){
        if(err){
          common.log(data);
          modelXlReport.insertSdLog(dataSD, req.query.ts, req.query.msg, function(err,data){
            if(!err){
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
        if(!err){
          resolve();
        }
      });
    });
    //reversal for new status R
    if(new_status== 'R'){
      await new Promise(function(resolve, reject) {
        reversalControl.index(transId, function(err,data){
          if(err){
            callback(err, data);
            return;
          }else{
            callback('', data);
            return;
          }
        });
      });
    }
    callback('','report has parsing');
    return;
  }catch(error){
    common.log("error report sms "+error.message);
    callback('failed', error.message);
    return;
  }
};
