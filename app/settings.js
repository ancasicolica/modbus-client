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

let config = require(configFile)
let settings = {
  name   : pkg.name,
  appName: pkg.title,
  version: pkg.version,
  debug  : (process.env.NODE_ENV !== 'production' || process.env.DEBUG) ? true : false,
  port   : _.get(config, 'server.port', 8080),
  config : config
};

settings.config.title = settings.config.title || 'Modbus Client';

// Add ids to the configuration, set levels
let i = 0;
let deviceNb = 1;
settings.config.devices.forEach(d => {

  d.id = deviceNb * 100;
  i = 1;

  d.elements.forEach(e => {
    e.id = deviceNb * 100 + i;
    i++;

    // Check the levels for warnings and errors, add placeholders if needed
    if (e.levels) {
      e.levels.alarmLow    = _.get(e, 'levels.alarmLow', Number.MAX_VALUE * (-1));
      e.levels.warningLow  = _.get(e, 'levels.warningLow', Number.MAX_VALUE * (-1));
      e.levels.warningHigh = _.get(e, 'levels.warningHigh', Number.MAX_VALUE);
      e.levels.alarmHigh   = _.get(e, 'levels.alarmHigh', Number.MAX_VALUE);
    }
  });
  deviceNb++;
});


module.exports = settings;


