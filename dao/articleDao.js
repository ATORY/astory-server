const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const config = require('config');

const DB_CONFIG = config.get('mongodb');

const ArticleSchema = {
  userId: null, // ObjectID
  title: null, // cell 显示
  shareImg: '',
  head: null, // cell 显示
  description: null, // 简述
  content: null,
  labels: [],
  read: 0,
  good: 0,
  collect: 0,
  comment: 0,
  createDate: new Date(),
  updateDate: new Date(),
  reject: false,
  rejectResion: '',
  topicId: '',
};

function ArticleDao(url) {
  this.url = url || DB_CONFIG.ASTORY.DB;
  this.connected = false;
  this.Err = function ArticleErr(message, status) {
    this.name = 'ArticleErr';
    this.message = message || 'ArticleErr';
    this.status = status || 401;
    this.stack = (new Error(message)).stack;
  };
}

module.exports.getService = function getService() {
  return new ArticleDao();
}

ArticleDao.prototype.init = async function init() {
  this.db = await MongoClient.connect(this.url);
  this.Coll = this.db.collection(DB_CONFIG.ASTORY.ARTICLE);
  this.connected = true;
  this.db.on('close', () => { this.connected = false; });
};

ArticleDao.prototype.allArticles = async function allArticle(currentId) {
  if (currentId && (typeof currentId !== 'string')) {
    throw this.Err('article id should be string')
  }
  if (!this.connected) await this.init();
  const query = currentId ? { _id: { $lt: new ObjectID(currentId) } } : {};
  const projection = {
    title: 1, userId: 1, read: 1, good: 1, collect: 1, head: 1, labels: 1, description: 1, createDate: 1,
  };
  const articles = await this.Coll.find(query).project(projection)
    .sort({ _id: -1 })
    .limit(15)
    .toArray();
  return articles;
};

ArticleDao.prototype.findArticle = async function findArticle(id) {
  let articleId = id;
  if (typeof id === 'string') {
    articleId = new ObjectID(id);
  }else {
    throw this.Err('article id should be string')
  }
  if (!this.connected) await this.init();
  const article = await this.Coll.findOneAndUpdate(
    { _id: articleId },
    { $inc: { read: 1 } },
    { returnOriginal: false });
  const value = article.value;
  return value;
};
