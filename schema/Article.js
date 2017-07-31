const ObjectID = require('mongodb').ObjectID;
const config = require('config');
const DB_CONFIG = config.get('mongodb');


const articleDao = require('../dao/articleDao');
const userDao = require('../dao/userDao');
const commentDao = require('../dao/commentDao');
const collectDao = require('../dao/collectDao');
const readDao = require('../dao/readDao');
const goodDao = require('../dao/goodDao');

const Article = `
  type Article {
    _id: ID!
    title: String
    content: String
    labels: [String]
    author: User
    readNumber: Int
    # readUser: [User]
    goodNumber: Int
    # goodUser: [User]
    collectNumber: Int
    # collectUser: [User]
    commentNumber: Int
    comments(limit: Int): [Comment]
    # refers(limit): [Article]
  }
`;

const ArticleQuery = {
  articles: async (_, { _id }) => {
    const articles = await articleDao.allArticles(_id);
    return articles
  },
  article: async (_, { _id }) => {
    const articleId = new ObjectID(_id);
    const article = await articleDao.findArticle(articleId);
    return article;
  }
}

const ArticleResolver = {
  Article: {
    author: async (article, args, context, info) => {
      const { userId } = article;
      const author = await userDao.getUser(userId);
      return author;
    },
    readNumber: async (article, args, context, info) => {
      const { _id } = article;
      const readNumber = readDao.articleReadNumber(_id);
      return readNumber;
    },
    goodNumber: async (article, args, content, info) => {
      const { _id } = article;
      const goodNumber = goodDao.articleGoodNumber(_id);
      return goodNumber;
    },
    collectNumber: async (article, args, content, info) => {
      const { _id } = article;
      const collectNumber = await collectDao.articleCollectNumber(_id);
      return collectNumber;
    },
    commentNumber: async (article, args, content, info) => {
      const { _id } = article;
      const commentNumber = await commentDao.articleCommnetsNumber(_id);
      return commentNumber;
    },
    comments: async (article, args, context, info) => {
      const { _id } = article;
      const { limit } = args;
      const comments = await commentDao.numberComments(_id, limit);
      return comments;
    }
  }
}

exports.Article = Article;
exports.ArticleQuery = ArticleQuery;
exports.ArticleResolver = ArticleResolver;
