/**
 * Author @nadir93
 * Date 2017.5.1
 */
'use strict';

const Logger = require('bunyan');
const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'lib',
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
  login: (client, user) => {
    //log.debug('user: ', user);
    util.setMySaveMoney(null);
    return new Promise((resolve, reject) => {
      log.debug('login start');
      client
        .waitForExist(util.getSelector('login_btn'), config.defaultWaitTime)
        .click(util.getSelector('login_btn'))
        .waitForExist(util.getSelector('etId'), config.defaultWaitTime)
        .keys(user.id)
        .click(util.getSelector('etPw'))
        .keys(user.password)
        .click(util.getSelector('btn_login'))
        .then(() => {
          log.debug('login success');
          return resolve();
        })
        .catch(e => {
          log.error('login fail: ', e);
          return reject(e);
        });
    });
  },

  job: (client, user) => {
    return new Promise((resolve, reject) => {
      function loop(count) {
        if (count < 0) {
          if (saveMoney > 0) {
            proc.sendMessage(user);
          }
          return resolve();
        }

        client
          .start(client)
          .showMeTheMoney(client)
          .stop(client)
          .then(() => {
            loop(--count);
          })
          .catch(e => {
            if (saveMoney > 0) {
              proc.sendMessage(user);
            }
            return reject(e);
          });
      }
      loop(config.jobCount);
    });
  },

  start: client => {
    return new Promise((resolve, reject) => {
      let size;
      let location;
      log.debug(' ==========================');
      client
        .waitForExist(util.getSelector('fullItemLayout'),
          config.defaultWaitTime)
        .then(() => {
          if (!util.getMySaveMoney()) {
            return client
              .waitForExist(util.getSelector('infomation_my_save_money'),
                config.defaultWaitTime)
              .getText(util.getSelector('infomation_my_save_money'))
              .then(mySaveMoney => {
                log.debug('| 적립금: ', mySaveMoney);
                util.setMySaveMoney(parseInt(mySaveMoney.replace(',', '')));
                return client.getElementSize(
                  util.getSelector('fullItemLayout'));
              });
          }
          return client.getElementSize(util.getSelector('fullItemLayout'));
        })
        .then(element => {
          //console.log('element: ', element);
          size = element;
          //log.debug('| start size: ', size);
          return client.getLocation(util.getSelector('fullItemLayout'));
        })
        .then(element => {
          location = element;
          //log.debug('| start location: ', location);
          //log.debug('| start location.y: ', location.y);
          log.debug('| start location.length: ', location.length);
          let locationY = location.y ?
            location.y : location[location.length - 1].y;
          log.debug('| start location.y: ', locationY);

          return client.touchAction([{
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
        })
        .then(resolve)
        .catch(e => {
          log.error('error: ', e);
          reject(e);
        });
    });
  },

  showMeTheMoney: client => {
    return new Promise((resolve, reject) => {
      let el;
      let size;
      let location;
      let type;

      client
        .getText(util.getSelector('advertiser_name'))
        .then(title => {
          title = Array.isArray(title) ? title[0].trim() : title.trim();
          log.debug('| title: ', title);
          return client.getText(util.getSelector('ad_type_text'));
        })
        .then(text => {
          //log.debug('| text: ', text);
          type = Array.isArray(text) ? text[0].trim() : text.trim();
          log.debug('| type: ', type);
          return client.element(util.getSelector('save_money'));
        })
        .then(element => {
          //log.debug('| element: ', element);
          if (element.status === 7) { //NoSuchElement
            log.debug('| [이미 적립됨]');
            return resolve();
          }

          el = element;
          client
            .elementIdLocation(el.value.ELEMENT)
            .then(element => {
              location = element;
              log.debug('| 뱃지 location: ', location.value);
              return client.elementIdSize(el.value.ELEMENT);
            })
            .then(element => {
              size = element;
              log.debug('| 뱃지 size: ', size.value);
              return client.elementIdText(el.value.ELEMENT);
            })
            .then(text => {
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
              return fn(client, {
                location: location,
                text: text
              });
            })
            .then(response => {
              if (response.saveMoney) {
                saveMoney += parseInt(response.saveMoney);
                util.setMySaveMoney(util.getMySaveMoney() +
                  parseInt(response.saveMoney));
              }
              return resolve();
            })
            .catch(e => {
              log.error('error: ', e);
              return reject(e);
            });
          //element ? '' : (log.debug('| [이미 적립됨]'); resolve(););
        })
        .catch(e => {
          log.error('error: ', e);
          return reject(e);
        });
    });
  },

  stop: client => {
    return new Promise((resolve, reject) => {
      let size;
      let location;
      let height;
      client
        .waitForExist(util.getSelector('fullItemLayout'),
          config.defaultWaitTime)
        .getElementSize(util.getSelector('fullItemLayout'))
        .then(element => {
          //console.log('element: ', element);
          size = element;
          //log.debug('| end size: ', size);

          height = size.height ? size.height : size[0].height;
          return client.getLocation(util.getSelector('fullItemLayout'));
        })
        .then(element => {
          location = element;
          //log.debug('| end location: ', location);
          //log.debug('| end location.y: ', location.y);
          log.debug('| stop location.length: ', location.length);
          let locationY = location.y ?
            location.y : location[location.length - 1].y;
          log.debug('| stop location.y: ', locationY);
          log.debug('| stop location.height: ', height);

          return client.touchAction([{
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
        })
        .then(() => {
          log.debug(' =========================|');
          resolve();
        })
        .catch(e => {
          log.error('error: ', e);
          reject(e);
        });
    });
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