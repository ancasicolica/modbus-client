/*
 Defining a single modbus element which is read out periodically

 */
const _            = require('lodash');
const EventEmitter = require('events').EventEmitter;
const util         = require('util');
const logger       = require('./logger').getLogger('lib:modbusElement');

function ModbusElement(client, element) {
  EventEmitter.call(this);
  this.client      = client;
  this.description = _.get(element, 'description', '');
  this.type        = _.get(element, 'type', 'coil');
  this.address     = _.get(element, 'address', 552);
  this.channel     = _.get(element, 'channel', 1);
  this.readonly    = _.get(element, 'readonly', true);
  this.length      = _.get(element, 'length', 1);
  this.interval    = _.get(element, 'interval', _.get(client, 'inverval', 5000));
  this.parser      = _.get(element, 'parser', 'word');
  this.id          = _.get(element, 'id', -1);
  this.value       = undefined; // This is the value of the element
  this.prevValue   = undefined; // Helps detecting changes
  this.collector   = undefined;
  let self         = this;

  logger.debug(`Add: a=${this.address} t=${this.type} i=${this.interval}`);

  switch (this.type) {
    case 'coil':

    function readCoil(callback) {
      self.client.readCoils(self.address, 1, function (err, data) {
        if (err) {
          logger.error(err);
        }
        else {
          // logger.debug(`rc: ${self.address} ${data.value}`);
          self.value = _.get(data, 'data[0]', undefined);
          // In case of a changed value: emit new data
          if (self.value !== self.prevValue) {
            self.emit('changed', self.getObject());
            self.prevValue = self.value;
          }
          // console.log(self.description, self.value);
        }
        callback(err);
      });
    }

      this.collector = readCoil;
      break;

    case 'inputRegister':

    function readInputRegister(callback) {
      self.client.readInputRegisters(self.address, self.length, function (err, data) {
        if (err) {
          logger.error(err);
        }
        else {
          // logger.debug(`rc: ${self.address} ${data.value}`);
          switch (self.parser) {
            case 'byte':
              // byte: just one byte value, print value in dec
              self.value = _.get(data, 'data[0]', 0);
              break;

            case 'word':
              // word: MSB first, print value in dec
              self.value = 256 * _.get(data, 'data[0]', 0);
              self.value += _.get(data, 'data[1]', 0);
              logger.debug('XXXX ' + data.data[0] + '-' + data.data[1]);
              break;

            case 'hex-string':
              // Every byte is written as hex value, sometimes used for firmware versions
              self.value = '';
              data.buffer.forEach(function (b) {
                self.value += b.toString(16) + ' ';
              });
              break;

            case 'ip-address':
              // Parse as IP address (ok, it's foolish as this address is also in the config! But just make it complete)
              self.value = `${data.buffer[0]}.${data.buffer[1]}.${data.buffer[2]}.${data.buffer[3]}`;
              break;

            case 'mac-address':
              // MAC Address
              self.value = '';
              data.buffer.forEach(function (b) {
                self.value += b.toString(16) + ':';
              });
              self.value = _.trim(self.value, ':');
              break;

            case 'string':
              // Convert the data to a string value
              self.value = String.fromCharCode.apply(null, data.buffer);
              logger.debug(self.data);
              break;
          }

          // In case of a changed value: emit new data
          if (self.value !== self.prevValue) {
            self.emit('changed', self.getObject());
            self.prevValue = self.value;
          }
          // console.log(self.description, self.value);
        }
        callback(err);
      });
    }

      this.collector = readInputRegister;
      break;
  }
}

util.inherits(ModbusElement, EventEmitter);

/**
 * Collects the data
 * @param callback
 * @returns {*}
 */
ModbusElement.prototype.collect = function (callback) {
  if (this.collector) {
    return this.collector(callback);
  }
  callback(null);
};

/**
 * Set the value of an element
 * @param value
 * @param callback
 * @returns {*}
 */
ModbusElement.prototype.setValue = function (value, callback) {
  let self = this;

  if (self.readonly) {
    return callback(new Error('Read only value'));
  }
  switch (self.type) {
    case 'coil':
      self.client.writeCoil(self.address, value)
        .then(function (d) {
          callback();
        })
        .catch(function (e) {
          callback(e);
        });
      break;
  }
};

/**
 * Returns the current value of the element
 * @returns {*}
 */
ModbusElement.prototype.getValue = function () {
  return this.value;
};

/**
 * Returns this element as object
 */
ModbusElement.prototype.getObject = function () {
  let self = this;
  return {
    description: self.description,
    type       : self.type,
    address    : self.address,
    channel    : self.channel,
    readOnly   : self.readonly,
    value      : self.value,
    prevValue  : self.prevValue,
    id         : self.id
  };
};

module.exports = ModbusElement;