// const MongoClient = require('mongodb').MongoClient;
// const ObjectID = require('mongodb').ObjectID;
const config = require('config');

const Base = require('./BaseDao');

const DB_CONFIG = config.get('mongodb');

class Read extends Base {
  constructor() {
    super();
    this.collection = DB_CONFIG.ASTORY.GOOD;
    this.Schema = {
      // _id
      userId: null,
      articleId: null,
      count: false,
      createDate: new Date(),
    };
  }

  async articleGoodNumber(articleId) {
    const goodNumber = await this.numbers(articleId);
    return goodNumber;
  }

  async userGoods(userId) {
    const goods = await this.articles(userId);
    return goods;
  }
}

module.exports = new Read();
