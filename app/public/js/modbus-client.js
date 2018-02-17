Vue.component('modbus-item', {
  props   : ['item'],
  template: '<div>a: {{item.type}} {{ item.address }} {{ item.value ? "x1":"x0"}}</div>'
});

Vue.component('modbus-list', {
  props   : ['list'],
  template: '<div><modbus-item v-for="item in list" v-bind:item="item" v-bind:key="item.address"> </modbus-item> </div>'
});

Vue.component('modbus-device', {
  props   : ['device'],
  template: '<div class="card"><div class="card-header">{{device.description}}</div><div class="card-body"><modbus-list v-bind:list="device.elements"></modbus-list></div></div>'
});

var modbusApp = new Vue({
  el     : '#modbus-app',
  data   : {
    settings: settings,
    devices : []
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
    updateData: function (d) {
      var self = this;
      console.log('ud', d);
      for (var t = 0; t < this.devices.length; t++) {
        var i = _.findIndex(this.devices[t].elements, {address: d.address});
        if (i >= 0) {
          console.log('item', this.devices[t].elements[i]);
          this.$set(this.devices[t].elements, i, _.assign({}, this.devices[t].elements[i], d)); // otherwise it won't update in the component
        }
        else {
          console.warn('Element not found', d);
        }
      }
    },
    /* Initializes all data, get complete dataset*/
    initData  : function (data) {
      var self = this;
      console.warn(data);
      data.devices.forEach(function (device) {
        device.elements.forEach(self.updateData)
      });
    }
  }
});

/*
  Socket.io connection handling
 */
var socket = io();
socket.on('data', modbusApp.updateData);
socket.on('init-data', modbusApp.initData);
