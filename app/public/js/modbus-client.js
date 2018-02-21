/*
 Modbus client
 (c) 2018 Christian Kuster, http://www.ancasicolica.ch
 */

var modbusApp = new Vue({
  el     : '#modbus-app',
  data   : {
    settings   : settings,
    devices    : [],
    view       : 0,
    currentItem: undefined
  },
  // App is created, fill in the settings
  created: function () {
    this.devices = _.get(settings, 'config.devices', []);
    this.devices.forEach(function (d) {
      d.elements.forEach(function (e) {
        e.type = 'init';
      });
    });
  },


  methods: {
    /* Updates data of ONE SINGLE element
    */
    updateData         : function (d) {
      var self = this;
      console.log('ud', d);
      for (var t = 0; t < this.devices.length; t++) {
        var i = _.findIndex(this.devices[t].elements, {id: d.id});
        if (i >= 0) {
          var element = this.devices[t].elements[i];

          if (element.levels) {
            // Check critical levels
            if (d.value <= element.levels.errorLow || d.value >= element.levels.errorHigh) {
              d.isError   = true;
              d.isWarning = false;
            }
            else if (d.value <= element.levels.warningLow || d.value >= element.levels.warningHigh) {
              d.isWarning = true;
              d.isError   = false;
            }
            else {
              d.isWarning = false;
              d.isError   = false;
            }
          }
          this.$set(this.devices[t].elements, i, _.assign({}, this.devices[t].elements[i], d)); // otherwise it won't update in the component
          console.log('item', this.devices[t].elements[i]);
        }
        else {
          console.warn('Element not found', d);
        }
      }
      // Check also current element
      if (self.currentItem && self.currentItem.id === d.id) {
        self.currentItem = d;
      }
    },
    /* Initializes all data, get complete dataset*/
    initData           : function (data) {
      var self = this;
      data.devices.forEach(function (device) {
        device.elements.forEach(self.updateData)
      });
    },
    edit               : function (item) {
      var self         = this;
      self.view        = 2;
      self.currentItem = item
      console.log('EDIT', item)
    },
    getDeviceForElement: function (element) {
      for (var t = 0; t < this.devices.length; t++) {
        var i = _.findIndex(this.devices[t].elements, {id: element.id});
        if (i >= 0) {
          return this.devices[t];
        }
      }
      return undefined;
    }
  }
});

/*
  Socket.io connection handling
 */
var socket = io();
socket.on('data', modbusApp.updateData);
socket.on('init-data', modbusApp.initData);
