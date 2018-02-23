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

    /* Socket.io connection handling */
    this.socket = io();
    this.socket.on('data', this.updateData);
    this.socket.on('init-data', this.initData);
  },


  methods: {
    /* Updates data of ONE SINGLE element
    */
    updateData      : function (d) {
      var self = this;
      console.log('ud', d);
      for (var t = 0; t < this.devices.length; t++) {
        var i = _.findIndex(this.devices[t].elements, {id: d.id});
        if (i >= 0) {
          var element = this.devices[t].elements[i];

          if (element.levels) {
            // Check critical levels
            if (d.value <= element.levels.alarmLow || d.value >= element.levels.alarmHigh) {
              d.isAlarm   = true;
              d.isWarning = false;
            }
            else if (d.value <= element.levels.warningLow || d.value >= element.levels.warningHigh) {
              d.isWarning = true;
              d.isAlarm   = false;
            }
            else {
              d.isWarning = false;
              d.isAlarm   = false;
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
        self.currentItem = _.assign({}, self.currentItem, d);
      }
    },
    /**
     *  Initializes all data, get complete dataset
     */
    initData        : function (data) {
      var self = this;
      data.devices.forEach(function (device) {
        device.elements.forEach(self.updateData)
      });
    },
    edit            : function (item) {
      var self         = this;
      self.view        = 2;
      self.currentItem = item;
      if (typeof(self.currentItem.value) === "boolean") {
        self.currentItem.newValue = self.currentItem.value ? 1 : 0;
      }
      else {
        self.currentItem.newValue = self.currentItem.value;
      }
      console.log('EDIT', item)
    },
    /**
     * Saves the value of the currentItem
     */
    saveValue       : function () {

      $.post('/edit/' + this.currentItem.deviceId + '/' +this.currentItem.id, this.currentItem, function (data) {
        console.log('SAVED', this.currentItem, data);
      }, 'json');


    },
    hasAlarmLevels  : function (item) {
      if (!item.levels) {
        return false;
      }
      return (item.levels.alarmLow > (Number.MAX_VALUE * (-1)) || item.levels.alarmHigh < Number.MAX_VALUE);
    },
    hasWarningLevels: function (item) {
      if (!item.levels) {
        return false;
      }
      return (item.levels.warningLow > (Number.MAX_VALUE * (-1)) || item.levels.warningHigh < Number.MAX_VALUE);
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

