const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const config = require('config');

const Base = require('./BaseDao');

const DB_CONFIG = config.get('mongodb');

class CommentDao extends Base {
  constructor() {
    super();
    this.collection = DB_CONFIG.ASTORY.COMMENT;
    this.Schema = {
      userId: null, // ObjectID
      articleId: null, // ObjectID
      originCommentId: null, // ObjectID
      content: '', // cell 显示
      goodNumber: 0,
      replyNumber: 0,
      createDate: new Date(),
    };
  }

  async numberComments(articleId, number = 5) {
    if (!(articleId instanceof ObjectID)) {
      throw new Error('articleId should be ObjectID')
    }
    if (!this.connected) await this.init();
    const comments = await this.Coll.find({ articleId }).sort({ _id: -1 }).limit(number).toArray();
    return comments;
  };

  async articleCommnetsNumber(articleId) {
    const commentsNumber = await this.numbers(articleId);
    return commentsNumber;
  };
}

module.exports = new CommentDao();
