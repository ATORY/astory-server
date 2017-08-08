const config = require('config');

const Base = require('./BaseDao');

const DB_CONFIG = config.get('mongodb');

class Mark extends Base {
  constructor() {
    super();
    this.collection = DB_CONFIG.ASTORY.MARK;
    this.Schema = {
      // _id
      userId: null,
      articleId: null,
      mark: false,
      createDate: new Date(),
    };
  }

  async newUserMark(userId, articleId, mark) {
    const createDate = new Date();
    const markRecord = Object.assign(
      {}, this.Schema, { userId, articleId, mark, createDate },
    );
    if (!this.connected) await this.init();
    await this.Coll.update(
      { userId, articleId }, markRecord, { upsert: true },
    );
    return markRecord;
  }

  async userMark(userId, articleId) {
    if (!this.connected) await this.init();
    const record = await this.Coll.findOne({ userId, articleId });
    return record;
  }
}

module.exports = new Mark();
