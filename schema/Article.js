const ObjectID = require('mongodb').ObjectID;
const config = require('config');
const DB_CONFIG = config.get('mongodb');
const moment = require('moment');

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
    draft: Boolean
    publishDate: String
  }

  input ArticleInput{
    _id: ID
    title: String
    content: String
    labels: [String]
    draft: Boolean
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

const ArticleMutation = {
  newArticle: async (_, { article }, context) => {
    const { user } = context.session;
    if(user) {
      let articleId = new ObjectID();
      const userId = new ObjectID(user._id);
      const { _id, title, content, draft } = article;
      const newArticle = { _id, title, content, draft };
      if(_id) {
        newArticleId = new ObjectID(_id);
        newArticle.updateDate = new Date();
      }else {
        newArticle.createDate = new Date();
      }
      if(draft === false) {
        newArticle.publishDate = new Date();
      }
      newArticle._id = articleId;
      await articleDao.newArticle(userId, newArticle);
      return { _id: articleId, draft };
    }else {
      return {}
    }
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
    },
    publishDate: (article) => {
      const { publishDate } = article;
      const date = moment(publishDate).utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      return date;
    }
  }
}

exports.Article = Article;
exports.ArticleQuery = ArticleQuery;
exports.ArticleMutation = ArticleMutation;
exports.ArticleResolver = ArticleResolver;
