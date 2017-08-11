const fs = require('fs');
const Router = require('koa-router');
const multer = require('koa-multer');
const config = require('config');
const fsOprate = require('./fsOprate');
// const jwtMiddle = require('../middleware/jwt');
// const userDao = require('../dao/userDao').getService();
// const imageDao = require('../dao/imageDao').getService();

const fileHost = config.get('profile.fileHost');
// const uploadPath = config.get('profile.uploadPath');
const uploadPath = config.get('profile.uploadPath');
const router = new Router({
  prefix: '/profile',
});


const storage = fsOprate.storage;
const upload = multer({ storage });

router.get('/', async (ctx) => {
  ctx.body = 'profile';
});

// form uploadFile
router.put('/', upload.single('file'), async (ctx) => {
  const userId = ctx.session.user && ctx.session.user._id;
  if (!userId) ctx.throw(403, '请确保已经登录');
  try {
    const { destination, hash, mimetype } = ctx.req.file;
    const filePath = ctx.req.file.path;
    const newPath = `${destination}/${userId}`;
    const fileName = `${hash}.${mimetype.split('/')[1]}`;
    const newFile = `${newPath}/${fileName}`;
    await fsOprate.confirmNewPath(newPath);
    await fsOprate.renameFile(filePath, newFile);
    const fileURL = `${fileHost}/${userId}/${fileName}`;
    // imageDao.upsertImage(userId, fileURL);
    ctx.body = { fileURL };
  } catch (err) {
    ctx.throw(err);
  }
});

// form uploadFile
router.put('/avatar', upload.single('file'), async (ctx) => {
  const userId = ctx.session.user && ctx.session.user._id;
  if (!userId) ctx.throw(403, '请确保已经登录');
  const type = ctx.params.type;
  const filePath = `${uploadPath}/${userId}_${type}.png`;
  const newPath = `${uploadPath}/${type}`;
  const newFile = `${newPath}/${userId}.png`;
  const options = { encoding: 'base64' };
  try {
    await fsOprate.newFile(filePath);
    const writeStream = fs.createWriteStream(filePath, options);
    // const readStream = fs.createReadStream(filePath, options);
    await new Promise((resolve, reject) => {
      let imgStr = '';
      ctx.req.setEncoding('utf8');
      ctx.req.on('data', (data) => {
        imgStr += data;
      });
      ctx.req.on('end', () => {
        writeStream.write(imgStr);
        writeStream.end();
        resolve('end');
      }).on('error', (err) => {
        reject(err);
      });
    });
    await fsOprate.confirmNewPath(newPath);
    const fileURL = await fsOprate.renameFile(filePath, newFile);
    // if (type === 'banner') {
    //   await userDao.updateUserBanner(userId, fileURL);
    // }
    // if (type === 'avatar') {
    //   await userDao.updateUserAvatar(userId, fileURL);
    // }
    // if (type === 'alipay') {
    //   await userDao.updateUserAliPay(userId, fileURL);
    // }
    // if (type === 'wechatpay') {
    //   await userDao.updateUserWechatPay(userId, fileURL);
    // }

    ctx.body = {
      fileURL,
    };
  } catch (err) {
    ctx.throw(err);
  }
});

module.exports = router;
