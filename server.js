/*
  Modbus client

 */

const settings     = require('./settings');
const ModbusDevice = require('./lib/modbusDevice');

console.log(settings);

let devices = [];
settings.config.devices.forEach(d => {
  let md = new ModbusDevice(d);
  md.on('changed', info => {
    console.log(`Changed: ${info.address} ${info.prevValue} -> ${info.value}`);
  });
  devices.push(md);
});

console.log(devices);