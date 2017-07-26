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
const appium = require('appium');

const WebClient = require('@slack/client').WebClient;
const token = config.token || ''; //see section above on sensitive data
const web = new WebClient(token);

loop(0);
sendToSlack('botMessage', '`노티투미봇`이 채굴작업을 시작합니다');

//schedule.scheduleJob(config.schedule, function() {
//  const timeout = Math.floor(Math.random() * 1800000);
//  log.debug('timeout: ', timeout);
setInterval(function() {
  loop(0);
  sendToSlack('botMessage', '`노티투미봇`이 채굴작업을 시작합니다');
}, 3660000 /*timeout*/ );
//});

function sendToSlack(title, msg) {

  //sendMessage to slack
  web.chat.postMessage(config.channel, null, {
    'attachments': [{
      'fallback': title,
      'color': '#36a64f',
      'pretext': title,
      //  'title': 'Slack API Documentation',
      //  'text': 'Optional text that appears within the attachment',,
      'fields': [{
        title: '메시지',
        value: msg,
        short: false
      }],
      'mrkdwn_in': ['text', 'pretext']
    }],
    unfurl_links: true,
    as_user: false,
    icon_url: 'https://lh5.ggpht.com/o2TT2aEVw9kGTk0CryRAG' +
      'pTZsotvo7ZmwDhXzq6bnXmPX4p15I0g6Roh6UB5VRx00uU=w300',
    username: '노티투미',
  }, (err, res) => {
    if (err) {
      log.error('web.chat.postMessage: ', err);
      return;
    }
    saveMoney = 0;
    log.debug(res);
  });
}

function loop(index) {
  if (index >= config.users.length) {
    log.debug('index: ', index);
    log.debug('users.length: ', config.users.length);
    sendToSlack('botMessage', '`노티투미봇`이 채굴작업을 종료합니다');
    return;
  }

  appium
    .main({
      port: 4723,
      host: '127.0.0.1',
      'loglevel': 'error'
    })
    .then(function(server) {
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

      client
        .init()
        .then(function() {
          log.debug('webdriverio initialized');
        })
        .login(client, config.users[index])
        .then(function() {
          log.debug('login success');
        })
        .job(client, config.users[index])
        .then(function() {
          log.debug('job finished');
        })
        .end()
        .then(function() {
          log.debug('webdriverio closed');
        })
        .catch(function(e) {
          log.error('error: ', e);
          sendToSlack(config.users[index].name + ' 작업중 에러발생', e.message);
          //return client.end().pause(10000);
        })
        .then(function() {
          return server.close();
        })
        .then(function() {
          log.debug('appium server closed');
        })
        .then(function() {
          loop(++index);
        });
    })
}
