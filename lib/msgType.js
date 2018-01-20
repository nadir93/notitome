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
  process: async(client, data) => {
    if (data.location.value.y > 320) {
      log.debug('| [이미 적립됨]');
      return {};
    }

    log.debug('| 적립금: ', `${data.text.value} 원`);

    //var activity = client.currentActivity()
    //console.log(activity); // returns android activity information

    await client.waitForVisible(util.getSelector('ad_image'), config.defaultWaitTime);
    await client.click(util.getSelector('ad_image'));
    await client.waitForVisible(util.getSelector('btn_ad_join'), config.defaultWaitTime);
    await client.click(util.getSelector('btn_ad_join'));
    await client.pause(400);

    await client.back();
    // await client.back();
    // await client.back();

    try {
      await client.waitForVisible(util.getSelector('btn_ad_save'), config.defaultWaitTime); // com.interpark.notitome:id/popup_ib_close //reward_bg
    } catch (e) {
      log.error(e);
      log.debug('try workaround 2 back!!!');
      // wd example
      await client.startActivity(
        'com.interpark.notitome',
        '.ui.activity.AvNotiToMe'
      );

      //await client.back();
      await client.pause(2000);

      for (let i = 0; i < 20; i += 1) {
        try {
          await client.start(client);

          let title = await client.getText(util.getSelector('advertiser_name'));
          title = Array.isArray(title) ? title[0].trim() : title.trim();
          log.debug('| title: ', title);

          if (title === data.title) {
            break;
          }
          await client.stop(client);
        } catch (e) {
          log.error(e);
        }
      }

      await client.waitForVisible(util.getSelector('ad_image'), config.defaultWaitTime);
      await client.click(util.getSelector('ad_image'));
      await client.waitForVisible(util.getSelector('btn_ad_save'), config.defaultWaitTime);
      //await client.back();
      //await client.back();
      //await client.back();
    }
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
