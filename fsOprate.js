const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('koa-multer');
const config = require('config');

const fileHost = config.get('profile.fileHost');
const uploadPath = config.get('profile.uploadPath');

function newFile(filePath, encoding) {
  const options = encoding ? {} : {
    encoding,
  };
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, '', options, (err) => {
      if (err) throw reject(err);
      resolve();
    });
  });
}
exports.newFile = newFile;

function confirmNewPath(newPath) {
  return new Promise((reslove, reject) => {
    if (fs.existsSync(newPath)) {
      reslove();
    } else {
      fs.mkdir(newPath, (err) => {
        if (err) reject(err);
        reslove();
      });
    }
  });
}
exports.confirmNewPath = confirmNewPath;

function renameFile(oldPath, newPath) {
  return new Promise((resolve, reject) => {
    fs.rename(oldPath, newPath, (err) => {
      if (err) reject(err);
      const relativePath = newPath.replace(uploadPath, '');
      const fileURL = `${fileHost}${relativePath}`;
      resolve(fileURL);
    });
  });
}
exports.renameFile = renameFile;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}`);
  },
});

storage._handleFile = function _handleFile(req, file, cb) {
  this.getDestination(req, file, (err, destination) => {
    if (err) {
      cb(err);
      return;
    }
    this.getFilename(req, file, (error, filename) => {
      if (error) {
        cb(error);
        return;
      }
      const hash = crypto.createHash('md5');
      const finalPath = path.join(destination, filename);
      const outStream = fs.createWriteStream(finalPath);

      // file.stream.pipe(crypto.createHash('md5').setEncoding('hex')).on('finish', function () {
      //   console.log(this.read()) //the hash
      //   const fileMD5 = this.read();
      //   console.log(fileMD5);
      //   cb()
      // })
      file.stream.pipe(outStream);
      outStream.on('error', cb);
      file.stream.on('data', (chunk) => {
        hash.update(chunk);
      });
      outStream.on('finish', () => {
        cb(null, {
          destination,
          filename,
          path: finalPath,
          size: outStream.bytesWritten,
          hash: hash.digest('hex'),
        });
      });
    });
  });
};
exports.storage = storage;
