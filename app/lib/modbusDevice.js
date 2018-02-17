/*
  A modbus device we're connecting to
 */
const _             = require('lodash');
const ModbusRTU     = require("modbus-serial");
const ModbusElement = require('./modbusElement');
const EventEmitter  = require('events').EventEmitter;
const util          = require('util');
const async         = require('async');
const logger        = require('./logger').getLogger('lib:modbusDevice');

/**
 * Constructor
 * @param device
 * @constructor
 */
function ModbusDevice(device) {
  EventEmitter.call(this);
  this.url      = _.get(device, 'server.url', 'localhost');
  this.port     = _.get(device, 'server.port', 552);
  this.id       = _.get(device, 'server.id', 1);
  this.interval = _.get(device, 'interval', 2000);

  this.client = new ModbusRTU();
  this.client.setID(this.id);

  this.collectors = [];

  this.elements = [];
  let self      = this;
  let elements  = _.get(device, 'elements', []);
  elements.forEach(e => {
    let me = new ModbusElement(self.client, e);
    if (me) {
      me.on('changed', obj => {
        self.emit('changed', obj);
      });
      self.collectors.push(me.collector);
      this.elements.push(me);
    }
  });

  self.connect(err => {
    // Start collection
    setInterval(function () {
      self.collect(err => {
        if (err) {
          logger.error(err);
        }
      })
    }, self.interval);
  });
}

util.inherits(ModbusDevice, EventEmitter);

ModbusDevice.prototype.connect = function (callback) {
  let self = this;
  self.client.connectTCP(self.url, {port: self.port}, (err) => {
    if (err) {
      logger.error(err);
      return callback(err);
    }
    // Just after connecting, collect data immediately
    self.collect(callback);
  });
};

/**
 * Collects all data
 * @param callback
 */
ModbusDevice.prototype.collect = function (callback) {
  let self = this;
  async.waterfall(self.collectors, callback);
};

ModbusDevice.prototype.getData = function () {
  let retVal = {
    url     : this.url,
    port    : this.port,
    id      : this.id,
    interval: this.interval,
    elements: []
  };
  this.elements.forEach(e => {
    retVal.elements.push(e.getObject());
  });
  return retVal;
};

module.exports = ModbusDevice;