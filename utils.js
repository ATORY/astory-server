const fs = require('fs');
const config = require('config');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const nodemailer = require('nodemailer');

const cert = config.get('cert');
// sign with RSA SHA256
const privateKey = fs.readFileSync(cert.private);
const publicKey = fs.readFileSync(cert.public);

const debug = process.env.NODE_ENV !== 'production';
if (debug) {
  winston.level = 'debug';
}

exports.loggerMiddleware = async (ctx, next) => {
  ctx.logger = winston;
  await next();
};

exports.sendEmail = (email, checkCode) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.163.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
      user: 'atory_cc@163.com',
      pass: 'atory123456',
    },
  });

  const mailOptions = {
    from: '"ATORY" <atory_cc@163.com>', // sender address
    to: email, // list of receivers
    subject: '密码找回', // Subject line
    text: checkCode, // plain text body
    html: `<b>${checkCode}</b>`, // html body
  };
  // 发送
  // console.log('Sending Mail');
  const sendCheckCode = new Promise((reslove, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) { reject(error); }
      reslove(info);
      // console.log('Message %s sent: %s', info.messageId, info.response);
    });
  });
  return sendCheckCode;
};

exports.signToken = (dataObj) => {
  const token = jwt.sign(dataObj, privateKey, { algorithm: 'RS256' });
  return token;
};

exports.verifyToken = async (ctx, next) => {
  const { session, headers } = ctx;
  if (session.user && session.user._id) {
    await next();
  } else {
    const bearerToken = headers.authorization;
    const token = bearerToken && bearerToken.replace('Bearer ', '');
    let user = '';
    if (token) {
      try {
        user = await new Promise((reslove, reject) => {
          jwt.verify(token, publicKey, (err, decoded) => {
            if (err) reject(err);
            reslove(decoded);
            // console.log('decoded', decoded); // bar
          });
        });
      } catch (err) {
        console.error(err);
      }
    }
    session.user = user;
    await next();
  }
};


// exports.log = console.log.bind(console);
// exports.err = console.error.bind(console);
// exports.midware = (req, res, next) => {
//   const ip = req.ip;
//   req.logger = {
//     log: function _log(...args) {
//       args.unshift(ip);
//       exports.log.apply(null, args);
//     },
//     err: function _err(...args) {
//       args.unshift(ip);
//       exports.err.apply(null, args);
//     },
//   };
//   next();
// };