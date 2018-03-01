/*
 Defining a single modbus element which is read out periodically

 */
const _            = require('lodash');
const EventEmitter = require('events').EventEmitter;
const util         = require('util');
const logger       = require('./logger').getLogger('lib:modbusElement');

/**
 * Determing the standard lenght to read out depending on the Parser
 * @param parser
 * @returns {number}
 */
function getLength(parser) {

  switch (parser) {
    case 'uint8':
    case 'byte':
      return 1;

    case 'uint16':
    case 'int16':
      return 1;

    case 'int32':
    case 'uint32':
    case 'float':
    case 'uint32_MLE':
    case 'int32_MLE':
      return 2;

    case 'ip-address':
      return 2;

    case 'mac-address':
      return 3;

    default:
      return -1;
  }
}

/**
 * Constructor for the modbus element
 * @param client
 * @param element
 * @constructor
 */
function ModbusElement(client, element) {
  EventEmitter.call(this);
  this.client      = client;
  this.description = _.get(element, 'description', '');
  this.type        = _.get(element, 'type', 'coil');
  this.address     = _.get(element, 'address', 552);
  this.channel     = _.get(element, 'channel', 1);
  this.readonly    = _.get(element, 'readOnly', true);
  this.interval    = _.get(element, 'interval', _.get(client, 'inverval', 5000));
  this.parser      = _.get(element, 'parser', 'byte');
  this.length      = _.get(element, 'length', getLength(this.parser));
  this.id          = _.get(element, 'id', -1);
  this.deviceId    = _.get(element, 'deviceId', -1);
  this.value       = undefined; // This is the value of the element
  this.prevValue   = undefined; // Helps detecting changes
  this.collector   = undefined;


  let self = this;

  logger.debug(`Add Element: id=${this.id} a=${this.address} t=${this.type} i=${this.interval}`);

  switch (this.type) {
    // Coils, FC01 ----------------------------------------------
    case 'coil':

    function readCoil(callback) {
      //logger.debug('readCoil ' + self.address);
      self.client.readDiscreteInputs(self.address, 1, function (err, data) {
        logger.info(`Read coil @ ${self.address}`);
        self.handleBinaryRegister(err, data, callback);
      });
    }

      this.collector = readCoil;
      break;

    // Input Status, FC02 ----------------------------------------------
    case 'inputStatus':

    function readInputStatus(callback) {
      //logger.debug('readInputStatus ' + self.address);
      self.client.readDiscreteInputs(self.address, 1, function (err, data) {
        logger.info(`Read input status @ ${self.address}`);
        self.handleBinaryRegister(err, data, callback);
      });
    }

      this.collector = readInputStatus;
      break;

    // INPUT REGISTER, FC04  ------------------------------------
    case 'inputRegister':

      this.collector = function (callback) {
        self.client.readInputRegisters(self.address, self.length, function (err, data) {
          logger.info(`Read input register @ ${self.address}, length ${self.length}`);
          self.handleDiscreteRegister(err, data, callback);
        })
      };
      break;

    // HOLDING REGISTER, FC03  ----------------------------------
    case 'holdingRegister':

      this.collector = function (callback) {
        self.client.readHoldingRegisters(self.address, self.length, function (err, data) {
          logger.info(`Read holding register @ ${self.address}, length ${self.length}`);
          self.handleDiscreteRegister(err, data, callback);
        });
      };
      break;

    default:
      throw new Error('Undefined register type: ' + self.type);
  }
}

util.inherits(ModbusElement, EventEmitter);

/**
 * Parse a buffer according to the configuration
 * @param buffer
 * @returns {*}
 */
ModbusElement.prototype.parse = function (_buffer) {
  let self   = this;
  let parser = self.parser;
  let buffer = undefined;

  switch (parser) {
    case 'uint32_MLE':
    case 'int32_MLE':
      // Mid-Little Endian (CDAB)
      buffer    = Buffer.alloc(4);
      buffer[0] = _buffer[2];
      buffer[1] = _buffer[3];
      buffer[2] = _buffer[0];
      buffer[3] = _buffer[1];
      break;

    default:
      // Big Endian (ABCD)
      buffer = _buffer;
      break;
  }

  switch (parser) {
    case 'uint8':
    case 'byte':
      // byte: just one byte value, print value in dec
      return buffer[0];

    case 'int16':
      // uint16: MSB first, print value in dec
      return buffer.readInt16BE(0);

    case 'uint16':
      // uint16: MSB first, print value in dec
      return buffer.readUInt16BE(0);

    case 'int32':
    case 'int32_MLE':
      // word: MSB first, print value in dec
      return buffer.readInt32BE(0);

    case 'uint32':
    case 'uint32_MLE':
      // word: MSB first, print value in dec
      //logger.info(`UINT32: ${buffer[0]}, ${buffer[1]}, ${buffer[2]}, ${buffer[3]} `)
      return buffer.readUInt32BE(0);

    case 'float':
      // float: MSB first, print value in dec
      return buffer.readFloatBE(0);

    case 'hex-string':
      // Every byte is written as hex value, sometimes used for firmware versions
      let hexStr = '';
      buffer.forEach(function (b) {
        hexStr += b.toString(16) + ' ';
      });
      return hexStr;

    case 'ip-address':
      // Parse as IP address (ok, it's foolish as this address is also in the config! But just make it complete)
      return `${buffer[0]}.${buffer[1]}.${buffer[2]}.${buffer[3]}`;

    case 'mac-address':
      // MAC Address
      let macAddress = '';
      buffer.forEach(function (b) {
        macAddress += b.toString(16) + ':';
      });
      return _.trim(macAddress, ':');

    case 'string':
      // Convert the data to a string value
      return String.fromCharCode.apply(null, buffer);

    default:
      throw new Error('Invalid parser: ' + self.parser);
  }
};

/**
 * Handle a discrete register read access (holding or input register)
 * @param err
 * @param data
 * @param callback
 * @returns {*}
 */
ModbusElement.prototype.handleDiscreteRegister = function (err, data, callback) {
  let self = this;
  if (err) {
    return callback(err);
  }
  else {
    // logger.debug(`rc: ${self.address} ${data.value}`);
    self.value = self.parse(data.buffer);

    // In case of a changed value: emit new data
    if (self.value !== self.prevValue) {
      self.emit('changed', self.getObject());
      self.prevValue = self.value;
    }
  }
  callback(err);
};

/**
 * Handle a binary register with read access
 * @param err
 * @param data
 * @param callback
 */
ModbusElement.prototype.handleBinaryRegister = function (err, data, callback) {
  if (err) {
    logger.error(`Error while reading binary Input with address ${self.address}`, err);
  }
  else {
    // logger.debug(`rc: ${self.address} ${data.buffer[0]}`);
    self.value = _.get(data, 'buffer[0]', -99) !== 0;
    // In case of a changed value: emit new data
    if (self.value !== self.prevValue) {
      self.emit('changed', self.getObject());
      self.prevValue = self.value;
    }
    // console.log(self.description, self.value);
  }
  callback(err);
};

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
  let self     = this;
  let oldvalue = -1;

  if (self.readonly) {
    logger.info(`Coil with address ${self.address} is read only!`);
    return callback(new Error('Read only value'));
  }
  switch (self.type) {
    case 'coil':
      value    = parseInt(value) !== 0;
      oldValue = self.value;
      self.client.writeCoil(self.address, value)
        .then(function (d) {
          logger.info(`Coil with address ${self.address} set to ${value}`, d);
          self.collect(err => {
            if (err) {
              return callback(err);
            }
            if (self.value && value || !self.value && !value) {
              logger.info('Data successful set to ' + value);
              return callback(null, {old: oldValue, current: value});
            }
            else {
              logger.info('Data NOT set to ' + value);
              return callback(new Error('Value not set'));
            }
          });
        })
        .catch(function (e) {
          logger.error(e);
          return callback(e);
        });
      break;

    case 'inputRegister':
      return callback(new Error('Writing holding registers is not supported'));

    case 'holdingRegister':
      let buffer;
      switch (self.parser) {
        case 'float':
          // Todo: this must be set into 2 Words, not 4 bytes!
          buffer = Buffer.alloc(4);
          buffer.writeFloatBE(parseFloat(value));
          break;

        default:
          // Todo: add all datatypes
          buffer    = Buffer.alloc(1);
          buffer[0] = parseInt(value);
          value     = parseInt(value);
          break;
      }

      oldValue = self.value;
      self.client.writeRegisters(self.address, buffer)
        .then(function (d) {
          logger.info(`Holding Register with address ${self.address} set to ${value}`, d);
          self.collect(err => {
            if (err) {
              return callback(err);
            }
            if (self.value === value) {
              logger.info('Data successful set to ' + value);
              return callback(null, {old: oldValue, current: value});
            }
            else {
              logger.info('Data NOT set to ' + value + ', is still ' + self.value);
              return callback(new Error('Value not set'));
            }
          });
        })
        .catch(function (e) {
          logger.error(e);
          return callback(e);
        });
      break;

    default:
      return callback(new Error('Not supported type: ' + self.type));
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
    parser     : self.parser,
    length     : self.length,
    id         : self.id,
    deviceId   : self.deviceId
  };
};

module.exports = ModbusElement;