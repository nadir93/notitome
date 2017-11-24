/**
 * Author @nadir93
 * Date 2017.5.1
 */
'use strict';

const Logger = require('bunyan');
const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'notitome',
  level: loglevel
});

const error = require('./lib/errorHandler');
const start = require('./lib/start');
const interval = 3660000;

//처음시작
start()
  .then()
  .catch(log.error);

//1시간주기로 루프F
setInterval(() => {
  start()
    .then()
    .catch();
}, interval);