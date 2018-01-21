Vue.component('modbus-item', {
  props   : ['item'],
  template: '<div>a: {{ item.data.type }} {{ item.address }} {{ item.data.value ? "1":"0"}}</div>'
});

Vue.component('modbus-list', {
  props   : ['list'],
  template: '<div><modbus-item v-for="item in list" v-bind:item="item" v-bind:key="item.address"> </modbus-item> </div>'
});

var modbusApp = new Vue({
      el     : '#modbus-app',
      data   : {
        settings: settings,
        view    : []
      },
      // App is created, fill in the settings
      created: function () {
        var self     = this;
        var elements = _.get(settings, 'config.devices[0].elements', []);
        elements.forEach(function (e) {
          e.data = {
            type: 'ndef'
          };

          self.view.push(e);
        });
      },


      methods: {
        updateData: function (d) {
          var self = this;
          console.log('ud', d);
          var i = _.findIndex(this.view, {address: d.address});
          if (i >= 0) {
            this.$set(this.view, i, _.assign({}, this.view[i], {data: d})); // otherwise it won't update in the component
          }
          else {
            console.warn('Element not found', d);
          }
        }
      }
    })
;


var socket = io();
socket.on('data', modbusApp.updateData);
