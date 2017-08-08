const articleDao = require('../dao/articleDao');

const Read = `
  type Read {
    _id: ID!
    createDate: String
    article: Article
  }
`;

const ReadQuery = {

};

const ReadResolver = {
  Read: {
    article: async (read, args, context, info) => {
      const { articleId } = read;
      const article = await articleDao.findArticle(articleId);
      return article;
    },
  },
};

exports.Read = Read;
exports.ReadQuery = ReadQuery;
exports.ReadResolver = ReadResolver;
