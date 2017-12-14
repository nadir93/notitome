/**
 * Author @nadir93
 * Date 2017.11.23
 */

const Logger = require('bunyan');

const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'server',
  level: loglevel,
});

const appium = require('appium');

let server;

const start = async () => {
  server = await appium.main({
    port: 4723,
    host: '127.0.0.1',
    loglevel: 'error',
  });
  log.debug('appium server started');
};

function pause() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 10000); // 10초
  });
}

const stop = async () => {
  if (server) {
    await server.close();
    await pause();
    log.debug('appium server stopped');
    server = null;
  }
};

module.exports.start = start;
module.exports.stop = stop;
