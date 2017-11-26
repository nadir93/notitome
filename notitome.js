/**
 * Author @nadir93
 * Date 2017.5.1
 */
'use strict';

const start = require('./lib/start');
const interval = 3660000;

//처음시작
start();

//1시간주기로 루프
setInterval(start, interval);

process.on('unhandledRejection', (reason, p) => {
  console.log('reason: ', reason);
  console.log('p: ', p);
  throw reason;
});

process.on('uncaughtException', e => {
  console.log('uncaughtException: ', e);
  console.error(e);
});