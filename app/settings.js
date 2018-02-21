/*
  Settings file

*/

/**
 * Settings file
 * Created by kc on 04.01.15
 */

const pkg      = require('../package.json');
const path     = require('path');
const argv     = require('minimist')(process.argv.slice(2));
const _        = require('lodash');
let configFile = path.join(__dirname, '..', 'config', argv.config || 'default.json');


let settings = {
  name   : pkg.name,
  appName: pkg.title,
  version: pkg.version,
  debug  : (process.env.NODE_ENV !== 'production' || process.env.DEBUG) ? true : false,
  port   : 8080,
  config : require(configFile)
};

settings.config.title = settings.config.title || 'Modbus Client';

// Add ids to the configuration, set levels
let i = 1;
settings.config.devices.forEach(d => {
  d.id = i++;
  d.elements.forEach(e => {
    e.id = i++;

    // Check the levels for warnings and errors, add placeholders if needed
    if (e.levels) {
      e.levels.errorLow    = _.get(e, 'levels.errorLow', Number.MAX_VALUE * (-1));
      e.levels.warningLow  = _.get(e, 'levels.warningLow', Number.MAX_VALUE * (-1));
      e.levels.warningHigh = _.get(e, 'levels.warningHigh', Number.MAX_VALUE);
      e.levels.errorHigh   = _.get(e, 'levels.errorHigh', Number.MAX_VALUE);
    }
  });
});


module.exports = settings;


