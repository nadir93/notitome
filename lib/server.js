/**
 * Author @nadir93
 * Date 2017.11.23
 */
'use strict';

const Logger = require('bunyan');
const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'server',
  level: loglevel
});

const appium = require('appium');

let server;

const start = async() => {
  server = await appium.main({
    port: 4723,
    host: '127.0.0.1',
    'loglevel': 'error'
  });
  log.debug('appium server started');
};

const stop = async() => {
  if (server) {
    await server.close();
    await pause();
    log.debug('appium server stopped');
    server = null;
  }
};

function pause() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve();
    }, 10000); //10초
  })
}

module.exports.start = start;
module.exports.stop = stop;