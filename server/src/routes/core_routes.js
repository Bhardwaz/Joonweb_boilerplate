const express = require('express');
const router = express.Router();
const { appHandshake, getSiteInfo } = require('../controller/core_controller');

router.get('/', appHandshake);
router.get('/api/v1/siteInfo', getSiteInfo);

module.exports = router;