// const appium = require('appium');
// console.log('appium: '+appium);

//let args = {port: 4723, host: '127.0.0.1'};
//let server = new appium(args);

//console.log('server: '+server);

main();

async function main() {
  try {
    await test();
  } catch (e) {
    console.error(e);
  }
}

async function test() {
  //try {
  await pause();
  //} catch (e) {
  //  console.error(e);
  //  throw new Error('error test #2');
  //}
  console.log('complete');
}


function pause() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return reject(new Error('error test #1'));
    }, 5000);
  })
}