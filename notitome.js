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

const start = require('./lib/start');
const interval = 3660000;

//처음시작
start()
  .then(() => {

  })
  .catch(log.error);

//1시간주기로 루프F
setInterval(() => {
  start()
    .then(() => {

    })
    .catch(log.error);
}, interval);

process.on('unhandledRejection', (reason, p) => {
  log.debug('reason: ', reason);
  log.debug('p: ', p);
  throw reason;
});

process.on('uncaughtException', e => {
  log.debug('uncaughtException: ', e);
  log.error(e);
});