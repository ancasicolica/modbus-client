// create an empty modbus client
const ModbusRTU = require("modbus-serial");
const moment    = require('moment');

const startUpTime = moment();

let buffer1 = Buffer.alloc(200);

function setUpTime(buf) {
  let diff = moment().diff(startUpTime, 'seconds')
  buf.writeUInt32BE(diff, 40);
}

setInterval(() => {
  setUpTime(buffer1);
  console.log('time set');
}, 1000);

const vector = {
  getInputRegister  : function (addr, unitID) {
    if (addr >= 5000 && addr < 5000 + (buffer1.length / 2)) {
      let index = (addr - 5000) * 2;
      let val   = buffer1[index] * 256 + buffer1[index + 1];
      console.log(addr, val);
      return val;
    }
  },
  getHoldingRegister: function (addr, unitID, callback) {
    // Asynchronous handling (with callback)
    setTimeout(function () {
      // callback = function(err, value)
      callback(null, addr + 8000);
    }, 10);
  },
  getCoil           : function (addr, unitID) {
    // Asynchronous handling (with Promises, async/await supported)
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve((addr % 2) === 0);
      }, 10);
    });
  },
  setRegister       : function (addr, value, unitID) {
    // Asynchronous handling supported also here
    console.log("set register", addr, value, unitID);
    return;
  },
  setCoil           : function (addr, value, unitID) {
    // Asynchronous handling supported also here
    console.log("set coil", addr, value, unitID);
    return;
  }
};

// set the server to answer for modbus requests
console.log("ModbusTCP listening on modbus://0.0.0.0:8502");
const serverTCP = new ModbusRTU.ServerTCP(vector, {host: "0.0.0.0", port: 8502, debug: true, unitID: 1});

serverTCP.on("socketError", function (err) {
  // Handle socket error if needed, can be ignored
  console.error(err);
});
