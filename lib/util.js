/**
 * Author @nadir93
 * Date 2017.5.1
 */

// const Logger = require('bunyan');

// const loglevel = 'debug';
// const log = new Logger.createLogger({
//   name: 'util',
//   level: loglevel,
// });

let mySaveMoney = null;

module.exports = {
  getSelector: id => `android=new UiSelector().resourceId("com.interpark.notitome:id/${id}")`,
  setMySaveMoney: (money) => {
    mySaveMoney = money;
  },
  getMySaveMoney: () => mySaveMoney,
  numberWithCommas: x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
};
