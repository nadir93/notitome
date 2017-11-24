/**
 * Author @nadir93
 * Date 2017.5.1
 */
'use strict';

const start = require('./lib/start');
const interval = 3660000;

//처음시작
main();

//1시간주기로 루프
setInterval(main, interval);

async function main() {
  try {
    const result = await start();
    console.log(result);
  } catch (e) {
    console.error(e);
  }
}

process.on('unhandledRejection', (reason, p) => {
  console.log('reason: ', reason);
  console.log('p: ', p);
  throw reason;
});

process.on('uncaughtException', e => {
  console.log('uncaughtException: ', e);
  console.error(e);
});