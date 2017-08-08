// const MongoClient = require('mongodb').MongoClient;
// const ObjectID = require('mongodb').ObjectID;
const config = require('config');

const Base = require('./BaseDao');

const DB_CONFIG = config.get('mongodb');

class Collect extends Base {
  constructor() {
    super();
    this.collection = DB_CONFIG.ASTORY.COLLECT;
    this.Schema = {
      // _id
      userId: null,
      articleId: null,
      collect: false, // true: collect, false: collected
      createDate: new Date(),
    };
  }

  async articleCollectNumber(articleId) {
    if (!this.connected) await this.init();
    const total = await this.Coll.find({ articleId, collect: true }).count();
    console.log(total);
    return total;
  }

  async userCollects(userId) {
    const collects = await this.articles(userId);
    return collects;
  }

  async newUserCollect(userId, articleId, collect) {
    const createDate = new Date();
    const collectRecord = Object.assign(
      {}, this.Schema, { userId, articleId, collect, createDate },
    );
    if (!this.connected) await this.init();
    await this.Coll.update(
      { userId, articleId }, collectRecord, { upsert: true },
    );
    return collectRecord;
  }

  async userCollect(userId, articleId) {
    if (!this.connected) await this.init();
    const record = await this.Coll.findOne({ userId, articleId });
    return record;
  }
}

module.exports = new Collect();
