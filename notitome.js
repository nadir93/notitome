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
const appium = require('appium');
const config = require('./config/config');
const process = require('./lib/process');
const sender = require('./lib/sender');

loop(config.users, 0);
sender.send('notitome 채굴시작', '`notitomeBot`이 채굴작업을 시작합니다');

//schedule.scheduleJob(config.schedule, function() {
//  const timeout = Math.floor(Math.random() * 1800000);
//  log.debug('timeout: ', timeout);
setInterval(function () {
  loop(config.users, 0);
  sender.send('notitome 채굴시작', '`notitomeBot`이 채굴작업을 시작합니다');
}, 3660000 /*timeout*/ );
//});

let failedUsers = [];
let retry = false;

function loop(users, index) {
  if (index >= users.length || config.users.length * 2 < users.length) {
    if (!retry && failedUsers.length > 0) {
      log.debug('failedUsers retrying', failedUsers);
      retry = true;
      loop(failedUsers, 0);
    } else {
      retry = false;
      failedUsers = [];
      log.debug('index: ', index);
      log.debug('users.length: ', users.length);
      sender.send('notitome 채굴종료', '`notitomeBot`이 채굴작업을 종료합니다');
    }
    return;
  }

  appium
    .main({
      port: 4723,
      host: '127.0.0.1',
      'loglevel': 'error'
    })
    .then(server => {
      log.debug('appium server started');
      //return server.close();

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
          failedUsers.push(users[index]);
          sender.send(users[index].name + ' 작업중 에러발생', e.message);
          //return client.end().pause(10000);
        })
        .end()
        .then(() => {
          log.debug('webdriverio closed');
        })
        .then(() => {
          return server.close();
        })
        .then(() => {
          log.debug('appium server closed');
        })
        .pause(10000)
        .then(() => {
          loop(users, ++index);
        });
    })
}