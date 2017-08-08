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
    const collectNumber = await this.numbers(articleId);
    return collectNumber;
  }

  async userCollects(userId) {
    const collects = await this.articles(userId);
    return collects;
  }
}

module.exports = new Collect();
