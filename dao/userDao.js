const crypto = require('crypto');
const ObjectID = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const config = require('config');
const { UserSchema } = require('../schema/User');
// const Lang = require('../config/lang.cn');

const DB_CONFIG = config.get('mongodb');

function UserDao(url) {
  this.url = url || DB_CONFIG.ASTORY.DB;
  this.connected = false;
  this.Err = function UserErr(message, status) {
    this.name = 'UserErr';
    this.message = message || 'UserErr';
    this.status = status || 401;
    this.stack = (new Error(message)).stack;
  };
}

module.exports.getService = function getService() {
  return new UserDao();
};

UserDao.prototype.init = async function init() {
  this.db = await MongoClient.connect(this.url);
  this.ColUser = this.db.collection(DB_CONFIG.ASTORY.USER);
  this.connected = true;
  this.db.on('close', () => { this.connected = false; });
};

UserDao.prototype.createUser = async function createUser(para) {
  const { email, password, username } = para;
  const record = Object.assign({}, User, { email, username });
  record._id = new ObjectID();
  record.password = generate(password);
  if (!this.connected) {
    await this.init();
  }
  const existOne = await this.ColUser.findOne({ email });
  if (existOne && existOne.password) {
    const password2 = existOne.password;
    if (check(password2, password)) {
      existOne.password = null;
      this.ColUser.update({ email }, { $set: { lastLogin: new Date() } });
      return existOne;
    }
    throw new this.Err(`${Lang.WRONG_PWD}`, 403);
  }
  const r = await this.ColUser.insertOne(record);
  if (r.result && r.result.ok === 1 && r.result.n === 1) {
    return r;
  }
  throw new this.Err('mongo insert err');
};

UserDao.prototype.getUser = async function getUser(uid) {
  let userId = uid;
  if (typeof userId === 'string') {
    userId = new ObjectID(uid);
  }
  if (!this.connected) {
    await this.init();
  }
  const fields = {
    email: 1,
    username: 1,
    userAvatar: 1,
    wechatPay: 1,
    aliPay: 1,
    lastLogin: 1,
    sign: 1,
    follow: 1,
    banner: 1,
  };
  const user = await this.ColUser.findOne({ _id: userId }, { fields });
  return user;
};

UserDao.prototype.updateUserPWD = async function createUser(para) {
  const email = para.email;
  let password = para.password;
  password = generate(password);
  if (!this.connected) {
    await this.init();
  }
  const user = await this.ColUser.findOne({ email });
  if (user) {
    const r = await this.ColUser.update({ email }, { $set: { password } });
    return r.result;
  }
  throw new this.Err(`${Lang.NO_SUCH_USER}`, 404);
};

UserDao.prototype.updateUserAvatar = async function updateUserAvatar(uid, avatarPath) {
  let userId = uid;
  if (typeof userId === 'string') {
    userId = new ObjectID(uid);
  }
  if (!this.connected) {
    await this.init();
  }
  const r = await this.ColUser.update({ _id: userId }, { $set: { userAvatar: avatarPath } });
  return r.result;
};

UserDao.prototype.updateUserBanner = async function updateUserBanner(uid, avatarPath) {
  let userId = uid;
  if (typeof userId === 'string') {
    userId = new ObjectID(uid);
  }
  if (!this.connected) {
    await this.init();
  }
  const r = await this.ColUser.update({ _id: userId }, { $set: { banner: avatarPath } });
  return r.result;
};

UserDao.prototype.updateUserWechatPay = async function createUser(uid, filePath) {
  let userId = uid;
  if (typeof userId === 'string') {
    userId = new ObjectID(uid);
  }
  if (!this.connected) {
    await this.init();
  }
  const r = await this.ColUser.update({ _id: userId }, { $set: { wechatPay: filePath } });
  return r.result;
};

UserDao.prototype.updateUserAliPay = async function createUser(uid, filePath) {
  let userId = uid;
  if (typeof userId === 'string') {
    userId = new ObjectID(uid);
  }
  if (!this.connected) {
    await this.init();
  }
  const r = await this.ColUser.update({ _id: userId }, { $set: { aliPay: filePath } });
  return r.result;
};

UserDao.prototype.updateUser = async function createUser(uid, updateObj) {
  let userId = uid;
  if (typeof userId === 'string') {
    userId = new ObjectID(uid);
  }
  if (!this.connected) {
    await this.init();
  }
  const r = await this.ColUser.update({ _id: userId }, { $set: updateObj });
  return r.result;
};


UserDao.prototype.login = async function login(option) {
  const { email, password } = option;
  if (!this.connected) {
    await this.init();
  }
  const user = await this.ColUser.findOne({ email });
  if (user) {
    const password2 = user.password;
    if (check(password2, password)) {
      user.password = null;
      this.ColUser.update({ email }, { $set: { lastLogin: new Date() } });
      return user;
    }
    throw new this.Err(`${Lang.WRONG_PWD}`, 403);
  }
  throw new this.Err(`${Lang.NO_SUCH_USER}`, 404);
};

function random() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 8; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function generate(pwd) {
  const salt = random();
  const hash = crypto.pbkdf2Sync(pwd, salt, 1000, 32, 'sha256').toString('hex');
  return `${salt}.${hash}`;
}

function check(hmac, password) {
  const ts = hmac.split('.');
  const salt = ts[0];
  const token = ts[1];
  return token === crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
}

// ============== test function ============//
UserDao.prototype.drop = async function drop() {
  if (process.env.NODE_ENV === 'test') {
    if (!this.connected) {
      await this.init();
    }
    await this.ColUser.deleteMany({});
  }
};

