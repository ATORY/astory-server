const Router = require('koa-router');
const randomString = require('random-string');

const utils = require('./utils');
const checkCodeDao = require('./dao/checkCodeDao');
const userDao = require('./dao/userDao');

const router = new Router({
  prefix: '/pwd',
});

router.get('/', async (ctx) => {
  ctx.body = 'pwd';
});

router.put('/', async (ctx) => {
  const body = ctx.request.body;
  const { email } = body;
  const eml = email.trim();
  const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailReg.test(eml)) {
    ctx.body = { msg: '请输入合法的email' };
    return;
  }
  const code = randomString();
  const result = await userDao.findEmail(email);
  if (result) {
    await utils.sendEmail(eml, code);
    await checkCodeDao.newRecord(eml, code);
    ctx.body = {};
    return;
  }
  ctx.body = { msg: '未发现该用户' };
});

router.post('/', async (ctx) => {
  const body = ctx.request.body;
  const { email, checkCode, password } = body;
  const record = await checkCodeDao.findRecord(email);
  if (record) {
    if (record.code !== checkCode) {
      ctx.body = { msg: '验证码不正确' };
      return;
    }
    if ((record.timeCamp + 600000) < Date.now()) {
      ctx.body = { msg: '验证码过期' };
      return;
    }
    // update password
    const { result } = await userDao.updateUserPWD(email, password);
    if (result.ok === 1 && result.nModified === 1) {
      ctx.body = {};
    } else {
      ctx.body = { msg: '未发现该用户' };
    }
  } else {
    ctx.body = { msg: '请在第一步先发送验证码' };
  }
});

module.exports = router;

