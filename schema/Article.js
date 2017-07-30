const Comment = require('./comment');
const config = require('config');
const DB_CONFIG = config.get('mongodb');

const articleDao = require('../dao/articleDao').getService();
const userDao = require('../dao/userDao').getService();

const Article = `
  type Article {
    _id: ID!
    title: String
    content: String
    author: User
    # comments: [Comment]
  }
`;

const ArticleQuery = {
  articles: async (_, { _id }) => {
    const articles = await articleDao.allArticles(_id);
    return articles
  },
  article: async (_, { _id }) => {
    const article = await articleDao.findArticle(_id);
    return article;
  }
}

const ArticleResolver = {
  Article: {
    author: async (article, args, context, info) => {
      const { userId } = article;
      const author = await userDao.getUser(userId);
      return author;
    }
  }
}

exports.Article = Article;
exports.ArticleQuery = ArticleQuery;
exports.ArticleResolver = ArticleResolver;