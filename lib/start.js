/**
 * Author @nadir93
 * Date 2017.11.23
 */
'use strict';

const Logger = require('bunyan');
const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'start',
  level: loglevel
});


const sender = require('./sender');
const config = require('../config/config');
const server = require('./server');
const client = require('./client');
// const schedule = require('node-schedule');

const start = () => {
  sender.send('notitome 채굴시작', '`notitomeBot`이 채굴작업을 시작합니다');
  return new Promise((resolve, reject) => {

    const failed = {
      users: []
    };

    let retry = false;

    function loop(users, index) {
      if (index >= users.length ||
        config.users.length * 2 < users.length) {
        if (!retry && failed.users.length > 0) {
          log.debug('failedUsers retrying', failed.users);
          retry = true;
          loop(failed.users, 0);
        } else {
          retry = false;
          failed.users = [];
          log.debug('index: ', index);
          log.debug('users.length: ', users.length);
          sender.send('notitome 채굴종료', '`notitomeBot`이 채굴작업을 종료합니다');
          return resolve('notitome 채굴종료');
        }
      }

      let appiumServer;

      server
        .start()
        .then(appium => {
          appiumServer = appium;
          log.debug('appium server started');
          return client.start(users, index, failed);
        })
        .then(() => {
          log.debug('webdriver stopped');
        })
        .then(() => {
          appiumServer.close();
        })
        .then(pause)
        .then(() => {
          log.debug('appium server stopped');
          return loop(users, ++index);
        })
        .catch(reject);
    }

    //초기호출
    loop(config.users, 0);
  });
};

function pause() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve();
    }, 10000);
  })
}

module.exports = start;