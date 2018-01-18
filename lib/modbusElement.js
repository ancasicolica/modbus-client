/*
 Defining a single modbus element which is read out periodically

 */
const _ = require('lodash');

function ModbusElement(client, element) {
  this.client      = client;
  this.description = _.get(element, 'description', '');
  this.type        = _.get(element, 'type', 'coil');
  this.address     = _.get(element, 'address', 552);
  this.channel     = _.get(element, 'channel', 1);
  this.readonly    = _.get(element, 'readonly', true);
  this.interval    = _.get(element, 'interval', 5000);

  let self = this;

  switch (this.type) {
    case 'coil':
      setInterval(function () {
        self.client.readCoils(self.address, 1, function (err, data) {
          self.value = _.get(data,'data[0]', undefined);
          console.log(self.description, self.value);
        });
      }, self.interval);
  }
}

/**
 * Set the value of an element
 * @param value
 * @param callback
 * @returns {*}
 */
ModbusElement.prototype.set = function (value, callback) {
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

module.exports = ModbusElement;