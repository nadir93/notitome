/**
 * Author @nadir93
 * Date 2017.5.1
 */
'use strict';

const Logger = require('bunyan');
const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'messageType',
  level: loglevel
});

const util = require('./util');
const config = require('../config');

module.exports = {
  process: function(client, data) {
    return new Promise((resolve, reject) => {

      if (data.location.value.y > 320) {
        log.debug('| [이미 적립됨]');
        return resolve({});
      }

      log.debug('| 적립금: ', data.text.value + ' 원');
      client
        .waitForVisible(util.getSelector('ad_image'),
          config.defaultWaitTime)
        .click(util.getSelector('ad_image'))
        .waitForVisible(util.getSelector('btn_ad_join'),
          config.defaultWaitTime)
        .click(util.getSelector('btn_ad_join'))
        .pause(3000)
        .back()
        .waitForVisible(util.getSelector('btn_ad_save'),
          config.defaultWaitTime)
        .click(util.getSelector('btn_ad_save'))
        .back()
        .then(function() {
          resolve({
            saveMoney: data.text.value
          });
        })
        .catch(function(e) {
          log.error('error: ', e);
          reject(e);
        });
    });
  }
};
