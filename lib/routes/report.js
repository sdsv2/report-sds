'use strict';

const express = require('express');
const router = express.Router();

const sms = require('../controllers/sms');
const ussd = require('../controllers/ussd');
const apiKey = require('../controllers/apiKey');

router.use('/sms/:apiKey', [apiKey.reportKey], sms.index);
router.use('/ussd/:apiKey', [apiKey.reportKey], ussd.index);

module.exports = router;
