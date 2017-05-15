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

const schedule = require('node-schedule');
const webdriverio = require('webdriverio');
const process = require('./lib/process');
const config = require('./config');

const client = webdriverio.remote({
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

client
  .addCommand('login', function async(client, user) {
    return process.login(client, user);
  });

client
  .addCommand('job', function async(client, user) {
    return process.job(client, user);
  });

client
  .addCommand('start', function async(client) {
    return process.start(client);
  });

client
  .addCommand('showMeTheMoney', function async(client) {
    return process.showMeTheMoney(client);
  });

client
  .addCommand('stop', function async(client) {
    return process.stop(client);
  });

schedule.scheduleJob(config.schedule, function() {
  function loop(index) {
    if (index >= config.users.length) {
      return;
    }
    client
      .init()
      .login(client, config.users[index])
      .job(client, config.users[index])
      .end()
      .then(function() {
        loop(++index);
      })
      .catch(function(e) {
        log.error('error: ', e);
        client.end();
      });
  }
  loop(0);
});
