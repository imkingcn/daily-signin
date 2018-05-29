const puppeteer = require('puppeteer');

const config = require('../config');

const { urls: URLS, elements: ELES } = config.sites.flyertea;

const getLoginFrame = (page) => {
  const childFrames = page.mainFrame().childFrames();

  console.log(
    'getLoginFrame.childFrames[].name',
    childFrames.map(frame => frame.name()),
  );

  const loginFrame = childFrames.find(frame => frame.name() === ELES.loginIframeName);
  return loginFrame;
};

const framePageMethods = {
  type: async (frame, selector, text) => {
    const element = await frame.$(selector);
    await element.type(text);
  },
  click: async (frame, selector) => {
    const element = await frame.$(selector);
    await element.click();
  },
};

const loginProcess = async (page) => {
  await page.goto(URLS.home, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: './dev-images/flyertea-home.png' });
};

const imageSuffix = ['.png', '.jpg'];
const abortImages = async (page) => {
  await page.setRequestInterception(true);
  page.on('request', (interceptedRequest) => {
    const isImage = !!imageSuffix.find(suffix =>
      interceptedRequest.url().endsWith(suffix));
    if (isImage) {
      interceptedRequest.abort();
    } else {
      interceptedRequest.continue();
    }
  });
};

const run = async () => {
  const browser = await puppeteer.launch(config.puppeteer);
  const page = await browser.newPage();
  await page.setViewport(config.puppeteer.viewport);
  await abortImages(page);

  // login with retry
  await loginProcess(page);

  await page.screenshot({
    path: './dev-images/flyertea-after-login-navigation.png',
  });
  // await page.waitForSelector(ELES.userInfo);

  // await page.waitFor(10000);
  // await page.click(ELES.dailySigninButton);
  // await page.screenshot({
  //   path: './dev-images/flyertea-after-click-signin.png',
  // });
  // // wait more 10s for api calling
  // await page.waitFor(10000);

  // const dailySigninButtonMessage = await page.$eval(
  //   ELES.dailySigninButton,
  //   // @ts-ignore
  //   div => div.innerText,
  // );
  // console.log('flyertea.dailySigninButton.message', {
  //   message: dailySigninButtonMessage,
  // });

  await browser.close();
};

module.exports = {
  run,
};
