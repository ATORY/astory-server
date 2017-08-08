const articleDao = require('../dao/articleDao');

const Mark = `
  type Mark {
    _id: ID!
    mark: Boolean
    createDate: String
    article: Article
  }
`;

const MarkQuery = {

};

const MarkResolver = {
  Mark: {
    article: async (mark, args, context, info) => {
      const { articleId } = mark;
      const article = await articleDao.findArticle(articleId);
      return article;
    },
  },
};

exports.Mark = Mark;
exports.MarkQuery = MarkQuery;
exports.MarkResolver = MarkResolver;
