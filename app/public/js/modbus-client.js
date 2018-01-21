console.log('modbus');
var socket = io();
socket.on('data', function (d) {
  console.log('data', d);
});