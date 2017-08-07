const winston = require('winston');

const debug = process.env.NODE_ENV !== 'production';
if (debug) {
  winston.level = 'debug';
}

exports.loggerMiddleware = async (ctx, next) => {
  ctx.logger = winston;
  await next();
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