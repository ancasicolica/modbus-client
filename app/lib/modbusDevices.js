/*
Modbus devices, a collection and controller of all devices
 */


const logger       = require('./logger').getLogger('lib:modbusDevices');
const ModbusDevice = require('./modbusDevice');
const _            = require('lodash');
let devices        = [];
let socket         = undefined;
let settings       = undefined;

function init(_settings, _socket, callback) {
  socket   = _socket;
  settings = _settings;
  settings.config.devices.forEach(d => {
    let md = new ModbusDevice(d);
    md.on('changed', info => {
      logger.info(`Changed: ${info.address} ${info.prevValue} -> ${info.value}`);
      socket.emit(info);
    });
    md.on('connected', (dev) => {
      logger.info(`Device ${dev.id} connected`);
    });
    md.on('disconnected', () => {
      logger.info('Device disconnected');
      // Try to connect after a delay
      _.delay(() => {
        md.connect(err => {
          logger.info('Reconnecting', err);
        });
      }, 2000);
    });
    md.connect(err => {
      if (err) {
        logger.error('Connection error', err);
      }
    });
    devices.push(md);
  });
  callback();
}

function getAllData() {
  let retVal = {
    devices: []
  };

  devices.forEach(dev => {
    retVal.devices.push(dev.getData());
  });

  return retVal;
}

module.exports = {
  init      : init,
  getAllData: getAllData
};