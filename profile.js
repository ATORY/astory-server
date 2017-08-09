// const fs = require('fs');
const Router = require('koa-router');
const multer = require('koa-multer');
const config = require('config');
const fsOprate = require('./fsOprate');
// const jwtMiddle = require('../middleware/jwt');
// const userDao = require('../dao/userDao').getService();
// const imageDao = require('../dao/imageDao').getService();

const fileHost = config.get('profile.fileHost');
// const uploadPath = config.get('profile.uploadPath');
const router = new Router({
  prefix: '/profile',
});


const storage = fsOprate.storage;
const upload = multer({ storage });

// router.get('/', async (ctx) => {
//   const userId = ctx.query._id;
//   if (!userId) ctx.throw(403, '请确保已经登录');
//   const userImages = await imageDao.userImages(userId);
//   const images = userImages.map(imageObj => imageObj.imageUrl);
//   ctx.body = images;
// });

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

module.exports = router;
