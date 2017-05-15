/**
 * Author @nadir93
 * Date 2017.5.1
 */
'use strict';

const Logger = require('bunyan');
const loglevel = 'debug';
const log = new Logger.createLogger({
  name: 'util',
  level: loglevel
});

let mySaveMoney = null;

module.exports = {
  getSelector: function(id) {
    return 'android=new UiSelector()' +
      '.resourceId("com.interpark.notitome:id/' + id + '")';
  },
  setMySaveMoney: function(money) {
    mySaveMoney = money;
  },
  getMySaveMoney: function() {
    return mySaveMoney;
  },
  numberWithCommas: function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
};
