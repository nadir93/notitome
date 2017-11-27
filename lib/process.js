/**
 * Author @nadir93
 * Date 2017.5.1
 */
'use strict';

const Logger = require('bunyan');
const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'process',
  level: loglevel
});

const msgType = require('./msgType');
const downloadAppType = require('./downloadAppType');
const util = require('./util');
const config = require('../config/config');

const WebClient = require('@slack/client').WebClient;
const token = config.token || ''; //see section above on sensitive data
const web = new WebClient(token);

let saveMoney = 0;

const proc = {
  login: async(client, user) => {
    //log.debug('user: ', user);
    util.setMySaveMoney(null);
    log.debug('login start');

    await client
      .waitForExist(util.getSelector('login_btn'), config.defaultWaitTime);

    await client.click(util.getSelector('login_btn'));

    await client.waitForExist(util.getSelector('etId'), config.defaultWaitTime);
    await client.keys(user.id);
    await client.click(util.getSelector('etPw'));
    await client.keys(user.password);
    await client.click(util.getSelector('btn_login'));
    log.debug('login success');
  },

  job: async(client, user) => {

    for (let i = 0; i < config.jobCount; i++) {
      try {
        await client.start(client);
        await client.showMeTheMoney(client);
        await client.stop(client);
      } catch (e) {
        if (saveMoney > 0) {
          proc.sendMessage(user);
        }
        throw e;
      }
    }
  },

  start: async client => {
    let size;
    let location;
    log.debug(' ==========================');
    await client.waitForExist(util.getSelector('fullItemLayout'),
      config.defaultWaitTime);

    if (!util.getMySaveMoney()) {
      await client.waitForExist(util.getSelector('infomation_my_save_money'),
        config.defaultWaitTime);
      const mySaveMoney =
        await client.getText(util.getSelector('infomation_my_save_money'));
      log.debug('| 적립금: ', mySaveMoney);
      util.setMySaveMoney(parseInt(mySaveMoney.replace(',', '')));
    }
    const element =
      await client.getElementSize(util.getSelector('fullItemLayout'));
    size = element;
    location = client.getLocation(util.getSelector('fullItemLayout'));
    log.debug('| start location.length: ', location.length);
    let locationY = location.y ?
      location.y : location[location.length - 1].y;
    log.debug('| start location.y: ', locationY);

    await client.touchAction([{
        action: 'press',
        x: 0,
        y: locationY
      }, {
        action: 'wait',
        ms: 100
      }, {
        action: 'moveTo',
        x: 0,
        y: config.baseLine - locationY
      }, {
        action: 'wait',
        ms: 100
      },
      'release'
    ]);
  },

  showMeTheMoney: async client => {
    let el;
    let size;
    let location;
    let type;

    const title = await client.getText(util.getSelector('advertiser_name'));
    title = Array.isArray(title) ? title[0].trim() : title.trim();
    log.debug('| title: ', title);

    const text = await client.getText(util.getSelector('ad_type_text'));
    type = Array.isArray(text) ? text[0].trim() : text.trim();
    log.debug('| type: ', type);

    const el = await client.element(util.getSelector('save_money'));
    if (el.status === 7) { //NoSuchElement
      log.debug('| [이미 적립됨]');
      return;
    }

    location = await client.elementIdLocation(el.value.ELEMENT);
    log.debug('| 뱃지 location: ', location.value);

    size = await client.elementIdSize(el.value.ELEMENT);
    log.debug('| 뱃지 size: ', size.value);

    const idText = client.elementIdText(el.value.ELEMENT);

    let fn;
    switch (type) {
      case '메시지형':
        fn = msgType.process;
        break;

        // case '앱다운로드형':
        //   downloadAppType.process;
        //   break;

        // case 동영상 시청
        // break;

      default:
        fn = (client, data) => {
          return new Promise((res, rej) => {
            res({});
          });
        };
        break;
    }

    const response = await fn(client, {
      location: location,
      text: idText
    });

    if (response.saveMoney) {
      saveMoney += parseInt(response.saveMoney);
      util.setMySaveMoney(util.getMySaveMoney() +
        parseInt(response.saveMoney));
    }
  },

  stop: async client => {

    let size;
    let location;
    let height;

    await client.waitForExist(util.getSelector('fullItemLayout'),
      config.defaultWaitTime);

    const size = await client
      .getElementSize(util.getSelector('fullItemLayout'));
    height = size.height ? size.height : size[0].height;

    location = await client.getLocation(util.getSelector('fullItemLayout'));

    log.debug('| stop location.length: ', location.length);
    let locationY = location.y ?
      location.y : location[location.length - 1].y;
    log.debug('| stop location.y: ', locationY);
    log.debug('| stop location.height: ', height);

    await client.touchAction([{
        action: 'press',
        x: 0,
        y: locationY + height
      }, {
        action: 'wait',
        ms: 100
      }, {
        action: 'moveTo',
        x: 0,
        y: config.baseLine - (locationY + height)
      }, {
        action: 'wait',
        ms: 100
      },
      'release'
    ]);

    log.debug(' =========================|');
  },

  sendMessage: user => {
    log.debug('saveMoney: ', saveMoney);
    log.debug('mySaveMoney: ', util.getMySaveMoney());

    //sendMessage to slack
    web.chat.postMessage(config.channel, null, {
      'attachments': [{
        'fallback': user.name + ': ' + saveMoney + '원이 적립되었습니다',
        'color': '#36a64f',
        'pretext': user.name + ':`' + saveMoney + '`원이 적립되었습니다',
        //  'title': 'Slack API Documentation',
        //  'text': 'Optional text that appears within the attachment',
        'fields': [{
          'title': '사용자',
          'value': user.name,
          'short': false
        }, {
          'title': '적립금',
          'value': saveMoney + '원',
          'short': true
        }, {
          'title': '총적립금',
          'value': util.numberWithCommas(util.getMySaveMoney()) + '원',
          'short': true
        }],
        'mrkdwn_in': ['text', 'pretext']
      }],
      unfurl_links: true,
      as_user: false,
      icon_url: 'https://lh5.ggpht.com/o2TT2aEVw9kGTk0CryRAG' +
        'pTZsotvo7ZmwDhXzq6bnXmPX4p15I0g6Roh6UB5VRx00uU=w300',
      username: '노티투미',
    }, (err, res) => {
      if (err) {
        log.error('web.chat.postMessage: ', err);
        return;
      }
      saveMoney = 0;
      log.debug(res);
    });
  }
};

module.exports = proc;