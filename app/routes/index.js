/**
 * The index route
 * Created by kc on 14.04.15.
 */

const express      = require('express');
const router       = express.Router();

/* GET home page. */
router.get('/', function (req, res) {

  res.render('index', {
    title       : 'Modbus Client'
  });

});

module.exports = router;
