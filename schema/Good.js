const articleDao = require('../dao/articleDao');

const Good = `
  type Good {
    _id: ID!
    createDate: String
    article: Article
  }
`;

const GoodQuery = {

};

const GoodResolver = {
  Good: {
    article:  async (good, args, context, info) => {
      const { articleId } = good;
      const article = await articleDao.findArticle(articleId);
      return article;
    }
  }
}

exports.Good = Good;
exports.GoodQuery = GoodQuery;
exports.GoodResolver = GoodResolver;
