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
const process = require('./process');
const config = require('../config/config');

const start = (users, index, failed) => {
  return new Promise((resolve, reject) => {
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

    client
      .init()
      .then(() => {
        log.debug('webdriverio initialized');
      })
      .login(client, users[index])
      .then(() => {
        log.debug('login success');
      })
      .job(client, users[index])
      .then(() => {
        log.debug('job finished');
      })
      .catch(e => {
        log.error('error: ', e);
        failed.users.push(users[index]);
        sender.send(users[index].name + ' 작업중 에러발생', e.message);
      })
      .end()
      .then(() => {
        log.debug('testCode');
      })
      .then(resolve)
      .catch(reject);
  })
};

function addCommand(client) {
  client
    .addCommand('login', async(client, user) => {
      return process.login(client, user);
    });

  client
    .addCommand('job', async(client, user) => {
      return process.job(client, user);
    });

  client
    .addCommand('start', async client => {
      return process.start(client);
    });

  client
    .addCommand('showMeTheMoney', async client => {
      return process.showMeTheMoney(client);
    });

  client
    .addCommand('stop', async client => {
      return process.stop(client);
    });
}

module.exports.start = start;