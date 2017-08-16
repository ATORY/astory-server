const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const config = require('config');

const DB_CONFIG = config.get('mongodb');

class Follow {
  constructor() {
    this.url = DB_CONFIG.ASTORY.DB;
    this.collection = DB_CONFIG.ASTORY.FOLLOW;
    this.Schema = {
      // _id
      userId: null,
      followId: null,
      follow: false,
      createDate: new Date(),
    };
  }

  async init(collection) {
    this.db = await MongoClient.connect(this.url);
    this.Coll = this.db.collection(collection || this.collection);
    this.connected = true;
    this.db.on('close', () => { this.connected = false; });
  }

  async newUserFollow(userId, followId, follow) {
    if (!(followId instanceof ObjectID)) {
      throw new Error('followId should be ObjectID');
    }
    if (!this.connected) await this.init();
    const createDate = new Date();
    const newOne = Object.assign({}, { userId, followId, follow, createDate });
    await this.Coll.update({ userId, followId }, { $set: newOne }, { upsert: true });
    return {
      _id: followId,
      followed: follow,
    };
  }

  async findFollow(userId, followId) {
    if (!this.connected) await this.init();
    const result = await this.Coll.findOne({ userId, followId });
    return !!(result && result.follow);
  }

  async userFollowsNum(userId) {
    if (!this.connected) await this.init();
    const total = await this.Coll.find({ followId: userId, follow: true }).count();
    return total;
  }

  // async articleGoodNumber(articleId) {
  //   const goodNumber = await this.numbers(articleId);
  //   return goodNumber;
  // }

  // async userGoods(userId) {
  //   const goods = await this.articles(userId);
  //   return goods;
  // }
}

module.exports = new Follow();
