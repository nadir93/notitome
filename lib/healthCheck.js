/**
 * Author @nadir93
 * Date 2017.5.1
 */

const Logger = require('bunyan');

const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'healthCheck',
  level: loglevel,
});

const {
  Client,
} = require('ssh2');

const conn = new Client();
conn.on('error', (error) => {
  log.error('error: ', error.message);
});
conn.on('ready', () => {
  log.debug('Client :: ready');
  conn.exec('uptime', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      log.debug(`Stream :: close :: code: ${code}, signal: ${signal}`);
      conn.end();
    }).on('data', (data) => {
      log.debug(`STDOUT: ${data}`);
    }).stderr.on('data', (data) => {
      log.debug(`STDERR: ${data}`);
    });
  });
});

// setInterval(testConn, 60000);

// function testConn() {
//   conn.connect({
//     host: '211.243.90.231',
//     port: 9322,
//     username: 'odroid',
//     password: 'adflow',
//   });
// }
// testConn();
