/**
 * Author @nadir93
 * Date 2017.11.23
 */
'use strict';

const Logger = require('bunyan');
const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'server',
  level: loglevel
});

const appium = require('appium');

const start = async() => {

  const server = await appium.main({
    port: 4723,
    host: '127.0.0.1',
    'loglevel': 'error'
  });
  return server;
};

module.exports.start = start;