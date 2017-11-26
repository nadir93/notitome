/**
 * Author @nadir93
 * Date 2017.11.23
 */
'use strict';

const Logger = require('bunyan');
const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'client',
  level: loglevel
});

const webdriverio = require('webdriverio');
const config = require('../config/config');
const process = require('./process');
const sender = require('./sender');

const start = async(user) => {
  //return new Promise((resolve, reject) => {
  const client = webdriverio.remote({
    //  host: '211.243.90.231', //'192.168.0.100',
    port: config.port,
    //logLevel: 'verbose',
    desiredCapabilities: {
      //'browserName': '',
      //'appiumVersion': '1.6.4',
      platformName: config.platformName,
      deviceName: config.deviceName,
      appPackage: config.appPackage,
      appActivity: config.appActivity,
      autoLaunch: true
    }
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
    sender.send(user.name + ' 작업중 에러발생', e.message);
    throw e;
  }

  // client
  //   .init()
  //   .then(() => {
  //     log.debug('webdriverio initialized');
  //   })
  //   .login(client, users[index])
  //   .then(() => {
  //     log.debug('login success');
  //   })
  //   .job(client, users[index])
  //   .then(() => {
  //     log.debug('job finished');
  //   })
  //   .catch(e => {
  //     log.error('error: ', e);
  //     failed.users.push(users[index]);
  //     sender.send(users[index].name + ' 작업중 에러발생', e.message);
  //   })
  //   .end()
  //   .then(() => {
  //     log.debug('webdriverio stopped');
  //   })
  //   .then(resolve)
  //   .catch(reject);
  // })
};

function addCommand(client) {
  client
    .addCommand('login', (client, user) => {
      return process.login(client, user);
    });

  client
    .addCommand('job', (client, user) => {
      return process.job(client, user);
    });

  client
    .addCommand('start', client => {
      return process.start(client);
    });

  client
    .addCommand('showMeTheMoney', client => {
      return process.showMeTheMoney(client);
    });

  client
    .addCommand('stop', client => {
      return process.stop(client);
    });
}

module.exports.start = start;