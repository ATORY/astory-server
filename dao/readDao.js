const MongoClient = require('mongodb').MongoClient;
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
      readTimes: 0,
      createDate: new Date(),
    }
  }

  async articleReadNumber(articleId) {
    const commentsNumber = await this.numbers(articleId);
    return commentsNumber;
  };

  async userReads(userId) {
    const reads = await this.articles(userId);
    return reads;
  }
}

module.exports = new Read();
