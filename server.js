/*
  Modbus client

 */

const settings     = require('./settings');
const ModbusDevice = require('./lib/modbusDevice');

console.log(settings);

let devices = [];
settings.config.devices.forEach(d => {
  devices.push(new ModbusDevice(d));
});

console.log(devices);