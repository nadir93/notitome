/**
 * Author @nadir93
 * Date 2017.5.1
 */
'use strict';

const Logger = require('bunyan');
const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'healthCheck',
  level: loglevel
});

var Client = require('ssh2').Client;

var conn = new Client();
conn.on('error', function(error) {
  log.error('error: ', error.message);
})
conn.on('ready', function() {
  log.debug('Client :: ready');
  conn.exec('uptime', function(err, stream) {
    if (err) throw err;
    stream.on('close', function(code, signal) {
      log.debug('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', function(data) {
      log.debug('STDOUT: ' + data);
    }).stderr.on('data', function(data) {
      log.debug('STDERR: ' + data);
    });
  });
});

setInterval(testConn, 60000);

function testConn() {
  conn.connect({
    host: '211.243.90.231',
    port: 9322,
    username: 'odroid',
    password: 'adflow'
  });
}
testConn();
