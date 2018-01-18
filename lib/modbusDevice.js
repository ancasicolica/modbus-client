/*
  A modbus device we're connecting to
 */
const _             = require('lodash');
const ModbusRTU     = require("modbus-serial");
const ModbusElement = require('./modbusElement');

/**
 * Constructor
 * @param device
 * @constructor
 */
function ModbusDevice(device) {
  this.url  = _.get(device, 'server.url', 'localhost');
  this.port = _.get(device, 'server.port', 552);
  this.id   = _.get(device, 'server.id', 1);

  this.client = new ModbusRTU();
  this.client.connectTCP(this.url, {port: this.port});
  this.client.setID(this.id);

  this.elements = [];
  let self      = this;
  let elements  = _.get(device, 'elements', []);
  elements.forEach(e => {
    this.elements.push(new ModbusElement(self.client, e))
  });
}

module.exports = ModbusDevice;