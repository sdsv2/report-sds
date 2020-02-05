'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const config = require('./lib/config.json');
const port = config.report.listen_port;
const common = require('./lib/common');

const report = require('./lib/routes/report');

const needReply = require('./lib/controllers/needReply');
const depositNeedReply = require('./lib/controllers/depositReply');
const smsOutbox = require('./lib/controllers/smsOutbox');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(function(req, res, next){
  common.log(req.method, req.originalUrl);
  next();
});

app.use('/report', report);

setInterval(() => {
  needReply.index();
  depositNeedReply.index();
  smsOutbox.index();
},1000);

app.use(function (req, res, next) {
  res.status(404).json({
    status: 404,
    message: 'Upps.. request service not found!'
  });
});

app.listen(port, () => common.log(`Report SDS listening on port ${port}!`));
