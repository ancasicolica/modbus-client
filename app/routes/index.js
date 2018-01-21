/**
 * The index route
 * Created by kc on 14.04.15.
 */

const express      = require('express');
const router       = express.Router();
const settings     = require('../settings');

let s = JSON.stringify(settings);

/* GET home page. */
router.get('/', function (req, res) {

  res.render('index', {
    title       : 'Modbus Client',
    settings    : s
  });

});

module.exports = router;
