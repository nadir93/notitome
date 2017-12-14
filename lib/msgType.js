/**
 * Author @nadir93
 * Date 2017.5.1
 */

const Logger = require('bunyan');

const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'messageType',
  level: loglevel,
});

const util = require('./util');
const config = require('../config/config');

module.exports = {
  process: async (client, data) => {
    if (data.location.value.y > 320) {
      log.debug('| [이미 적립됨]');
      return {};
    }

    log.debug('| 적립금: ', `${data.text.value} 원`);

    await client.waitForVisible(util.getSelector('ad_image'), config.defaultWaitTime);
    await client.click(util.getSelector('ad_image'));
    await client.waitForVisible(util.getSelector('btn_ad_join'), config.defaultWaitTime);
    await client.click(util.getSelector('btn_ad_join'));
    await client.pause(400);
    await client.back();
    await client.waitForVisible(util.getSelector('btn_ad_save'), config.defaultWaitTime); // com.interpark.notitome:id/popup_ib_close //reward_bg
    await client.click(util.getSelector('btn_ad_save'));
    await client.pause(400);

    const response = await client.isExisting(util.getSelector('popup_ib_close'));

    log.debug('popup_ib_close exist: ', response);
    if (response) {
      data.text.value = 0;
      await client.back();
    }

    await client.back();

    return {
      saveMoney: data.text.value,
    };

    // TODO: 적립금 받기 버튼이 없을 경우 그냥 skip하도록 처리해야함
  },
};
