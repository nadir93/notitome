// const appium = require('appium');
// console.log('appium: '+appium);

// let args = {port: 4723, host: '127.0.0.1'};
// let server = new appium(args);

// console.log('server: '+server);

function pause() {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('error test #1')), 5000);
  });
}

async function test() {
  // try {
  await pause();
  // } catch (e) {
  //  console.error(e);
  //  throw new Error('error test #2');
  // }
  console.log('complete');
}

async function main() {
  try {
    await test();
  } catch (e) {
    console.error(e);
  }
}

main();
