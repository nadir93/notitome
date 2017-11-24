/**
 * Author @nadir93
 * Date 2017.11.23
 */
'use strict';

const Logger = require('bunyan');
const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'errorHandler',
  level: loglevel
});

module.exports = {

};