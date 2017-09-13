const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const config = require('config');

const DB_CONFIG = config.get('mongodb');

class ArticleDao {
  constructor() {
    this.Schema = {
      userId: null, // ObjectID
      title: null, // cell 显示
      shareImg: '',
      // head: null, // cell 显示
      description: null, // 简述 SEO
      content: null,
      labels: [],
      draft: true,
      del: false,
      // read: 0,
      // good: 0,
      // collect: 0,
      // comment: 0,
      createDate: new Date(),
      updateDate: new Date(),
      publishDate: new Date(),
      reject: false,
      rejectResion: '',
      topicId: '',
    };
    this.url = DB_CONFIG.ASTORY.DB;
    this.Coll = null;
    this.connected = false;
    this.Err = function ArticleErr(message, status) {
      this.name = 'ArticleErr';
      this.message = message || 'ArticleErr';
      this.status = status || 401;
      this.stack = (new Error(message)).stack;
    };
  }

  async init() {
    this.db = await MongoClient.connect(this.url);
    this.Coll = this.db.collection(DB_CONFIG.ASTORY.ARTICLE);
    this.connected = true;
    this.db.on('close', () => { this.connected = false; });
  }

  async allArticles(currentId) {
    if (currentId && (typeof currentId !== 'string')) {
      throw this.Err('article id should be string');
    }
    if (!this.connected) await this.init();
    const query = currentId ?
      { _id: { $lt: new ObjectID(currentId) }, draft: false, del: false } :
      { draft: false, del: false };
    const articles = await this.Coll.find(query)
      // .project(projection)
      .sort({ _id: -1 })
      .limit(15)
      .toArray();
    return articles;
  }

  async findArticle(articleId, userId) {
    if (!(articleId instanceof ObjectID)) {
      throw this.Err('articleId should be string');
    }
    let query = { _id: articleId, del: false };
    if (userId && (userId instanceof ObjectID)) {
      query = { _id: articleId, userId, del: false };
    }
    if (!this.connected) await this.init();
    const article = await this.Coll.findOne(query);
    return article;
  }

  async userArticles(userId, articleId, draft) {
    if (!(userId instanceof ObjectID)) {
      throw new Error('userId should be ObjectID');
    }
    if (!this.connected) await this.init();
    const articles = await this.Coll.find({ userId, draft })
      .sort({ _id: -1 }).toArray();
    return articles;
  }

  async userDrafts(userId) {
    if (!(userId instanceof ObjectID)) {
      throw new Error('userId should be ObjectID');
    }
    if (!this.connected) await this.init();
    const articles = await this.Coll.find({ userId, draft: true })
      .sort({ _id: -1 }).toArray();
    return articles;
  }

  async newArticle(userId, article) {
    if (!(userId instanceof ObjectID)) {
      throw new Error('userId should be ObjectID');
    }
    if (!this.connected) await this.init();
    // confirm article belong to user
    const newOne = Object.assign({}, this.Schema, { userId }, article);
    const { _id } = newOne;
    const existArticle = await this.Coll.findOne({ _id });
    if ((existArticle === null) || (existArticle.userId.toString() === userId.toString())) {
      const r = await this.Coll.update({ _id }, { $set: newOne }, { upsert: true });
      if (r.result && r.result.ok === 1 && r.result.n === 1) {
        return { _id, draft: newOne.draft };
      }
      throw new this.Err('mongo insert err');
    } else {
      return { meg: '没有该文章或没又权限' };
    }
  }

  async delArticle(userId, articleId) {
    if (!(userId instanceof ObjectID)) {
      throw new Error('userId should be ObjectID');
    }
    if (!this.connected) await this.init();
    await this.Coll.update({ _id: articleId, userId }, { $set: { del: true } });
  }
}

module.exports = new ArticleDao();

