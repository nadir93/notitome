'use strict';

const Logger = require('bunyan');
const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'test',
  level: loglevel
});

const server = require('../lib/server');
const config = require('../config/config');
const client = require('../lib/client');

test();

async function test() {
  try {
    await server.start();
    await client.start(config.users[0]);
  } catch (e) {
    log.error(e);
  } finally {
    await server.stop();
  }

}

function pause() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve();
    }, 10000); //10초
  })
}
