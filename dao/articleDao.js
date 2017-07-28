const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const config = require('config');

const DB_CONFIG = config.get('mongodb');

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

const { ArticleSchema } = require('../schema/Article');

ArticleDao.prototype.init = async function init() {
  this.db = await MongoClient.connect(this.url);
  this.Coll = this.db.collection(DB_CONFIG.ASTORY.ARTICLE);
  this.connected = true;
  this.db.on('close', () => { this.connected = false; });
};

ArticleDao.prototype.newArticle = async function newArticle(uId, article) {
  let userId = uId;
  if (typeof userId === 'string') {
    userId = new ObjectID(userId);
  }
  const _newOne = Object.assign({}, ArticleSchema);
  const newOne = Object.assign(_newOne, { userId }, article);
  newOne.createDate = new Date();
  if (!this.connected) await this.init();
  const r = await this.Coll.insertOne(newOne);
  if (r.result && r.result.ok === 1 && r.result.n === 1) {
    return r;
  }
  throw new this.Err('mongo insert err');
};

ArticleDao.prototype.upsertArticle = async function upsertArticle(uid, articleId, article) {
  let userId = uid;
  if (typeof userId === 'string') { userId = new ObjectID(userId); }
  let _id = articleId;
  if (_id && (typeof _id === 'string')) {
    _id = new ObjectID(_id);
  }
  let newOne = Object.assign({}, { userId }, article);
  if (_id) {
    newOne.updateDate = new Date();
  } else {
    _id = new ObjectID();
    newOne = Object.assign({}, ArticleSchema, { userId }, article);
    newOne.createDate = new Date();
  }
  if (!this.connected) await this.init();
  const r = await this.Coll.update({ _id }, { $set: newOne }, { upsert: true });
  if (r.result && r.result.ok === 1 && r.result.n === 1) {
    r.result._id = _id;
    return r.result;
  }
  throw new this.Err('mongo upsert err');
};

ArticleDao.prototype.findArticle = async function findArticle(id) {
  let articleId = id;
  if (typeof id === 'string') {
    articleId = new ObjectID(id);
  }
  if (!this.connected) await this.init();
  const article = await this.Coll.findOneAndUpdate(
    { _id: articleId },
    { $inc: { read: 1 } },
    { returnOriginal: false });
  const value = article.value;
  return value;
};

ArticleDao.prototype.findArticleRefers = async function findArticle(id) {
  let articleId = id;
  if (typeof id === 'string') {
    articleId = new ObjectID(id);
  }
  if (!this.connected) await this.init();
  const article = await this.Coll.findOne({ _id: articleId });
  const { userId } = article;
  const userInfo = await this.UserColl.findOne({ _id: userId });
  const { email, username, userAvatar, wechatPay, aliPay } = userInfo;
  const refers = await this.Coll.find({ userId, _id: { $not: { $eq: articleId } } })
    .limit(3).toArray();
  refers.forEach((referArticle) => {
    referArticle.author = { email, username, userAvatar, wechatPay, aliPay };
  });
  return refers;
};

ArticleDao.prototype.goodArticle = async function findArticle(id) {
  let articleId = id;
  if (typeof id === 'string') {
    articleId = new ObjectID(id);
  }
  if (!this.connected) await this.init();
  const r = await this.Coll.findOneAndUpdate({ _id: articleId },
    { $inc: { good: 1 } },
    { returnOriginal: false, projection: { good: 1 } });
  return r.value;
};

ArticleDao.prototype.updateArticle = async function updateArticle(id, uId, updates) {
  let articleId = id;
  if (typeof id === 'string') {
    articleId = new ObjectID(id);
  }
  let userId = uId;
  if (typeof userId === 'string') {
    userId = new ObjectID(userId);
  }
  if (!this.connected) await this.init();
  const r = await this.Coll.update({ _id: articleId }, { $set: { updates } });
  return r.result;
};


ArticleDao.prototype.allArticles = async function allArticle(currentId) {
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

ArticleDao.prototype.userArticles = async function userArticles(userid) {
  let userId = userid;
  if (typeof userId === 'string') {
    userId = new ObjectID(userId);
  }
  if (!this.connected) await this.init();
  const projection = {
    title: 1, userId: 1, read: 1, good: 1, collect: 1, head: 1, labels: 1, description: 1, createDate: 1,
  };
  const articles = await this.Coll.find({ userId }).project(projection)
    .sort({ _id: -1 })
    .toArray();
  // const author = await this.UserColl.findOne({ _id: userId });
  // articles.forEach((article) => {
  //   const { email, username, userAvatar } = author;
  //   article.author = { email, username, userAvatar };
  // });
  return articles;
};

ArticleDao.prototype.userArticle = async function userArticle(uId, id) {
  let articleId = id;
  let userId = uId;
  if (typeof articleId === 'string') {
    articleId = new ObjectID(articleId);
  }
  if (typeof userId === 'string') {
    userId = new ObjectID(userId);
  }
  if (!this.connected) await this.init();
  const article = await this.Coll.findOne({ userId, _id: articleId });
  return article;
};

// ============== test function ============//
ArticleDao.prototype.drop = async function drop() {
  if (process.env.NODE_ENV === 'test') {
    if (!this.connected) {
      await this.init();
    }
    await this.Coll.deleteMany({});
  }
};

