// const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const config = require('config');

const Base = require('./BaseDao');

const DB_CONFIG = config.get('mongodb');

class Read extends Base {
  constructor() {
    super();
    this.collection = DB_CONFIG.ASTORY.READ;
    this.Schema = {
      // _id
      userId: null,
      articleId: null,
      count: 0,
      createDate: new Date(),
    };
  }

  async articleReadNumber(articleId) {
    const commentsNumber = await this.numbers(articleId);
    return commentsNumber;
  }

  async userReads(userId) {
    const reads = await this.articles(userId);
    return reads;
  }

  async userReadCount(userId, articleId) {
    if (!(articleId instanceof ObjectID)) {
      throw new Error('userId should be ObjectID');
    }
    if (!this.connected) await this.init();
    this.Coll.update({ userId, articleId }, { $inc: { count: 1 } }, { upsert: true });
    // return record;
  }
}

module.exports = new Read();
