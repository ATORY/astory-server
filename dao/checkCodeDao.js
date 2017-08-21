const MongoClient = require('mongodb').MongoClient;
const config = require('config');

const DB_CONFIG = config.get('mongodb');

class CheckCode {
  constructor(url) {
    this.url = url || DB_CONFIG.ASTORY.DB;
    this.collection = DB_CONFIG.ASTORY.CHECKCODE;
    this.connected = false;
    this.Schema = {
      // _id
      email: null,
      code: null,
      timeCamp: 0, // true: collect, false: collected
      createDate: new Date(),
    };
  }

  async init(collection) {
    this.db = await MongoClient.connect(this.url);
    this.Coll = this.db.collection(collection || this.collection);
    this.connected = true;
    this.db.on('close', () => { this.connected = false; });
  }

  async newRecord(email, code) {
    const createDate = new Date();
    const timeCamp = Date.now();
    const record = Object.assign(
      {}, this.Schema, { email, code, timeCamp, createDate },
    );
    if (!this.connected) await this.init();
    const result = await this.Coll.update(
      { email }, { $set: record }, { upsert: true });
    return result;
  }

  async findRecord(email) {
    if (!this.connected) await this.init();
    const record = await this.Coll.findOne({ email });
    return record;
  }
}

module.exports = new CheckCode();
