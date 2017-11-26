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

const start = async() => {
  sender.send('notitome 채굴시작', '`notitomeBot`이 채굴작업을 시작합니다');
  //return new Promise((resolve, reject) => {

  const failedUsers = [];

  for (let i = 0; i < config.users.length; i++) {

    let appiumServer = null;
    try {
      appiumServer = await server.start();
      log.debug('appium server started');
      await client.start(config.users[i]);
    } catch (e) {
      log.error('에러: ', e);
      failedUsers.push(config.users[i]);
    } finally {
      if (appiumServer) {
        await appiumServer.close();
        log.debug('appium server stopped');
      }
      await pause();
    }
  }

  log.debug('failedUsers: ', failedUsers);
  //TODO: 실패한 유저 다시한번 채굴
  sender.send('notitome 채굴종료', '`notitomeBot`이 채굴작업을 종료합니다');
};

function pause() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve();
    }, 10000); //10초
  })
}

module.exports = start;