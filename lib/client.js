/**
 * Author @nadir93
 * Date 2017.11.23
 */

const Logger = require('bunyan');

const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'client',
  level: loglevel,
});

const webdriverio = require('webdriverio');
const config = require('../config/config');
const process = require('./process');
const sender = require('./sender');

function addCommand(client) {
  client.addCommand('login', (user) => {
    process.login(client, user);
  });

  client
    .addCommand('job', (user) => {
      process.job(client, user);
    });

  client
    .addCommand('start', (user) => {
      process.start(client, user);
    });

  client
    .addCommand('showMeTheMoney', () => {
      process.showMeTheMoney(client);
    });

  client
    .addCommand('stop', () => {
      process.stop(client);
    });
}

const start = async (user) => {
  const client = webdriverio.remote({
    //  host: 192.168.0.100',
    port: config.port,
    // logLevel: 'verbose',
    desiredCapabilities: {
      // 'browserName': '',
      // 'appiumVersion': '1.6.4',
      platformName: config.platformName,
      deviceName: config.deviceName,
      appPackage: config.appPackage,
      appActivity: config.appActivity,
      autoLaunch: true,
    },
  });

  addCommand(client);

  try {
    await client.init();
    log.debug('webdriverio initialized');
    await client.login(client, user);
    log.debug('login success');
    await client.job(client, user);
    log.debug('job finished');
    await client.end();
    log.debug('webdriverio stopped');
  } catch (e) {
    log.error('error: ', e);
    sender.send(`${user.name} 작업중 에러발생`, e.message);
    throw e;
  }
};

module.exports.start = start;
