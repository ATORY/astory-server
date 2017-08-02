const crypto = require('crypto');
const ObjectID = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const config = require('config');

const DB_CONFIG = config.get('mongodb');

class UserDao {
  constructor(url) {
    this.Schema = {
      email: null, // *unique
      password: null,
      username: null,
      userAvatar: '',
      sign: '',
      wechatPay: '',
      aliPay: '',
      follow: 0,
      banner: '',
      createDate: new Date(),
      lastUpdate: new Date(),
      lastLogin: new Date(),
    };
    this.url = url || DB_CONFIG.ASTORY.DB;
    this.db = null;
    this.Coll = null;
    this.connected = false;
    this.Err = function UserErr(message, status) {
      this.name = 'UserErr';
      this.message = message || 'UserErr';
      this.status = status || 401;
      this.stack = (new Error(message)).stack;
    };
  }

  async init() {
    this.db = await MongoClient.connect(this.url);
    this.Coll= this.db.collection(DB_CONFIG.ASTORY.USER);
    this.connected = true;
    this.db.on('close', () => { this.connected = false; });
  };

  async createUser(para) {
    const { email, password, username = 'hi' } = para;
    const record = Object.assign({}, this.Schema, { email, username });
    record._id = new ObjectID();
    record.password = generate(password);
    if (!this.connected) { await this.init(); }
    const existOne = await this.Coll.findOne({ email });
    if (existOne && existOne.password) {
      const password2 = existOne.password;
      if (check(password2, password)) {
        existOne.password = null;
        this.Coll.update({ email }, { $set: { lastLogin: new Date() } });
        return existOne;
      }
      throw new this.Err(`密码错误`, 403);
    }
    const r = await this.Coll.insertOne(record);
    if (r.result && r.result.ok === 1 && r.result.n === 1) {
      return {
        _id: r.insertedId,
        email, username
      };
    }
    throw new this.Err('mongo insert err');
  };

  async getUser(userId) {
    if (!( userId instanceof ObjectID )) {
      throw new this.Err(`userId should be ObjectID`, 403);
    }
    if (!this.connected) {  await this.init(); };
    const user = await this.Coll.findOne({ _id: userId });
    return user;
  };
}

module.exports = new UserDao();


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