const articleDao = require('../dao/articleDao');

const Collect = `
  type Collect {
    _id: ID!
    collect: Boolean
    createDate: String
    article: Article
  }
`;

const CollectQuery = {

};

const CollectResolver = {
  Collect: {
    article: async (collect, args, context, info) => {
      const { articleId } = collect;
      const article = await articleDao.findArticle(articleId);
      return article;
    },
  },
};

exports.Collect = Collect;
exports.CollectQuery = CollectQuery;
exports.CollectResolver = CollectResolver;
