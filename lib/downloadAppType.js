/**
 * Author @nadir93
 * Date 2017.5.1
 */
'use strict';

const Logger = require('bunyan');
const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'downloadAppType',
  level: loglevel
});

const util = require('./util');
const config = require('../config');

function getSelector(id) {
  return 'android=new UiSelector()' +
    '.resourceId("com.android.vending:id/' + id + '")';
}

module.exports = {
  process: (client, resolve, reject, location, text) => {
    if (location.value.y > 320) {
      log.debug('| [이미 적립됨]');
      return resolve();
    }

    log.debug('| 적립금: ', text.value + ' 원');
    client
      .waitForVisible(util.getSelector('fullItemLayout'),
        config.defaultWaitTime)
      .click(util.getSelector('fullItemLayout'))
      .waitForVisible(util.getSelector('btn_ad_join'),
        config.defaultWaitTime)
      .click(util.getSelector('btn_ad_join'))
      .waitForVisible(getSelector('buy_button'),
        config.defaultWaitTime)
      .click(getSelector('buy_button'))
      .waitForVisible(getSelector('continue_button'),
        config.defaultWaitTime)
      .click(getSelector('continue_button'))
      .pause(30000)
      .back()
      .waitForVisible(util.getSelector('btn_ad_save'),
        config.defaultWaitTime)
      .click(util.getSelector('btn_ad_save'))
      .waitForVisible(util.getSelector('popup_ib_center_btn'),
        config.defaultWaitTime)
      .click(util.getSelector('popup_ib_center_btn'))
      .waitForVisible(util.getSelector('btn_ad_save'),
        config.defaultWaitTime)
      .click(util.getSelector('btn_ad_save'))
      .back()
      .then(resolve)
      .catch(e => {
        log.error('error: ', e);
        //add skip list
        reject(e);
      });
  }
};