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

  const failedUsers = [];

  for (let i = 0; i < config.users.length; i++) {

    try {
      await getMoney(config.users[i]);
    } catch (e) {
      log.error('에러: ', e);
      failedUsers.push(config.users[i]);
    }
  }

  log.debug('failedUsers: ', failedUsers);

  for (let i = 0; i < failedUsers.length; i++) {

    try {
      await getMoney(failedUsers[i]);
    } catch (e) {
      log.error('에러: ', e);
    }
  }

  sender.send('notitome 채굴종료', '`notitomeBot`이 채굴작업을 종료합니다');
};

async function getMoney(user) {
  try {
    await server.start();
    await client.start(user);
  } finally {
    await server.stop();
  }
}

module.exports = start;