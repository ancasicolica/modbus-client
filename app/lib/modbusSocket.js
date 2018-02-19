/*
  socket.io connection to the web client
 */

let io;

const logger        = require('./logger').getLogger('lib:modbusSocket');
const EventEmitter  = require('events').EventEmitter;
const util          = require('util');
const _             = require('lodash');
const modbusDevices = require('./modbusDevices');

/**
 * Class for the socket
 * @param server
 * @constructor
 */
function ModbusSocket(server) {
  EventEmitter.call(this);
  this.sockets = [];

  io = require('socket.io')(server);

  let self = this;
  io.on('connection', function (socket) {
    logger.info(`Socket added: ${socket.id}`);
    self.sockets.push(socket);

    socket.emit('init-data', modbusDevices.getAllData());

    socket.on('disconnect', () => {
      logger.info(`Socket removed: ${socket.id}`);
      _.pull(self.sockets, socket)
    });
  });

}

util.inherits(ModbusSocket, EventEmitter);

/**
 * Emit the data on the 'data' channel
 * @param data
 */
ModbusSocket.prototype.emit = function (data) {
  // logger.debug('Socket: emit data', data);
  this.sockets.forEach(s => {
    s.emit('data', data);
  });
};


// Just have one instance of the service
let modbusSocket = undefined;

module.exports = function (server) {
  if (!modbusSocket) {
    modbusSocket = new ModbusSocket(server);
  }
  return modbusSocket;
};