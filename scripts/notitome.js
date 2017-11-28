/**
 * Author @nadir93
 * Date 2017.5.1
 */
'use strict';

const Logger = require('bunyan');
const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'notitome',
  level: loglevel
});

const _ = require('lodash');
const publicIp = require('public-ip');
const start = require('../lib/start');
const config = require('../config/config');
const util = require('../lib/util');
const interval = 3660000;

//처음시작
start();

//1시간주기로 루프
setInterval(start, interval);

process.on('unhandledRejection', (reason, p) => {
  console.log('reason: ', reason);
  console.log('p: ', p);
  throw reason;
});

process.on('uncaughtException', e => {
  console.log('uncaughtException: ', e);
  console.error(e);
});

module.exports = function (robot) {

  robot.respond(/ip/i, function (msg) {
    //log.debug('msg: ', msg);

    publicIp.v4()
      .then(ip => {
        log.debug(ip);
        //=> '46.5.21.123'
        msg.send({
          "attachments": [{
            //"title": "trlog get {전화번호}",
            //"pretext": " ** ",
            //"text": "https://www.npmjs.com/package/crstankbot",
            "fields": [{
              "title": "odroid ip address",
              "value": "" + ip,
              "short": false
            }],
            "mrkdwn_in": ["text", "pretext", "fields"],
            "color": "good"
          }],
          unfurl_links: true,
          as_user: false,
          icon_url: 'https://lh5.ggpht.com/o2TT2aEVw9kGTk0CryRAG' +
            'pTZsotvo7ZmwDhXzq6bnXmPX4p15I0g6Roh6UB5VRx00uU=w300',
          username: '노티투미'
        });
      });
  });

  robot.respond(/money/i, function (msg) {
    //log.debug('msg: ', msg);

    const users = [];
    _.forEach(config.users, function (user) {
      users.push({
        'title': '사용자',
        'value': user.name,
        'short': true
      });
      users.push({
        'title': '총적립금',
        'value': util.numberWithCommas(user.savedMoney) + '원',
        'short': true
      });
    });

    msg.send({
      'attachments': [{
        'fallback': '`적립금` 리스트',
        'color': '#36a64f',
        'pretext': '`적립금` 리스트',
        //  'title': 'Slack API Documentation',
        //  'text': 'Optional text that appears within the attachment',
        'fields': users,
        'mrkdwn_in': ['text', 'pretext']
      }],
      unfurl_links: true,
      as_user: false,
      icon_url: 'https://lh5.ggpht.com/o2TT2aEVw9kGTk0CryRAG' +
        'pTZsotvo7ZmwDhXzq6bnXmPX4p15I0g6Roh6UB5VRx00uU=w300',
      username: '노티투미'
    });
  });
}
