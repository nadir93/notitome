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

const publicIp = require('public-ip');
const start = require('../lib/start');
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
          }]
        });
      });
  });
}
