/**
 * Author @nadir93
 * Date 2017.11.23
 */
'use strict';

const Logger = require('bunyan');
const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'sender',
  level: loglevel
});

const config = require('../config/config');
const WebClient = require('@slack/client').WebClient;
const token = config.token || ''; //see section above on sensitive data
const web = new WebClient(token);

const send = (title, msg) => {

  //sendMessage to slack
  web.chat.postMessage(config.channel, null, {
    'attachments': [{
      'fallback': title,
      'color': '#36a64f',
      'pretext': title,
      //  'title': 'Slack API Documentation',
      //  'text': 'Optional text that appears within the attachment',,
      'fields': [{
        title: '메시지',
        value: msg,
        short: false
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
    log.debug(res);
  });
}

module.exports.send = send;