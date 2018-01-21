/*
Main app file for modbus-client

(c) 2018 Christian Kuster, Wernetshausen
 */


const settings     = require('./settings');
const ModbusDevice = require('./lib/modbusDevice');
const express      = require('express');
const path         = require('path');
const morgan       = require('morgan');
const compression  = require('compression');
const moment       = require('moment');
const app          = express();
const server       = require('http').Server(app);
const logger       = require('./lib/logger').getLogger('main:app');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
morgan.token('prefix', function getId() {
  return 'http: ' + moment().format();
});
app.use(morgan(':prefix :method :status :remote-addr :url'));

app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', require('./routes/index'));
console.log(settings);

let devices = [];
settings.config.devices.forEach(d => {
  let md = new ModbusDevice(d);
  md.on('changed', info => {
    logger.info(`Changed: ${info.address} ${info.prevValue} -> ${info.value}`);
  });
  devices.push(md);
});


server.listen(8080, 'localhost', () => {
  logger.info('%s: Node server started on %s:%d ...',
    new Date(Date.now()), app.get('ip'), app.get('port'));

});