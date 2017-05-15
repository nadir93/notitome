/**
 * Author @nadir93
 * Date 2017.5.1
 */
'use strict';

module.exports = {
  defaultWaitTime: 10000,
  jobCount: 20,
  deviceName: 'YOUR-DEVICE-ID',
  appPackage: 'com.interpark.notitome',
  appActivity: '.ui.activity.AvNotiToMe',
  platformName: 'Android',
  baseLine: 275,
  users: [{
    id: 'YOUR-USER-ID',
    name: 'NAME',
    password: 'PASSWORD',
  }, {
    id: 'YOUR-USER-ID',
    name: 'NAME',
    password: 'PASSWORD',
  }],
  schedule: '*/30 * * * *',
  port: 4723,
  channel: 'YOUR-SLACK-CHANNEL',
  token: 'YOUR-SLACK-TOKEN'
};
