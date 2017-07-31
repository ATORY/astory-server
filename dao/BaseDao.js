const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const config = require('config');

const DB_CONFIG = config.get('mongodb');


class Base {
  constructor(url) {
    this.url = url || DB_CONFIG.ASTORY.DB;
    this.connected = false;
  }

  async init(collection) {
    this.db = await MongoClient.connect(this.url);
    this.Coll = this.db.collection(this.collection);
    this.connected = true;
    this.db.on('close', () => { this.connected = false; });  
  }

  async numbers(articleId) {
    if (!(articleId instanceof ObjectID)) {
      throw new Error('articleId should be ObjectID')
    }
    if (!this.connected) await this.init();
    const numbers = await this.Coll.find({ articleId }).count();
    return numbers;
  };

  async articles(userId) {
    if(!(userId instanceof ObjectID )) {
      throw new Error('userId should be ObjectID');
    }
    if (!this.connected) await this.init();
    const articles = await this.Coll.find({userId}).sort({ _id: -1 }).toArray();
    return articles;
  }
}

module.exports = Base;