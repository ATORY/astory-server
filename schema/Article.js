const ObjectID = require('mongodb').ObjectID;
// const config = require('config');
const moment = require('moment');

const articleDao = require('../dao/articleDao');
const userDao = require('../dao/userDao');
const commentDao = require('../dao/commentDao');
const collectDao = require('../dao/collectDao');
const readDao = require('../dao/readDao');
const goodDao = require('../dao/goodDao');
const markDao = require('../dao/markDao');

const Article = `
  type Article {
    _id: ID!
    title: String
    content: String
    shareImg: String
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
    mark: Boolean
  }

  input ArticleInput{
    _id: ID
    title: String
    content: String
    shareImg: String
    labels: [String]
    draft: Boolean
  }
`;

const ArticleQuery = {
  articles: async (_, { _id }) => {
    const articles = await articleDao.allArticles(_id);
    return articles;
  },
  article: async (_, { _id }) => {
    const articleId = new ObjectID(_id);
    const article = await articleDao.findArticle(articleId);
    if (article.reject === true) {
      article.content = '被撤销';
      return article;
    }
    if (article.draft === true) {
      article.content = '尚未发布或被撤销';
      return article;
    }
    return article;
  },
};

const ArticleMutation = {
  newArticle: async (_, { article }, context) => {
    const { user } = context.session;
    if (user) {
      let newArticleId = new ObjectID();
      const userId = new ObjectID(user._id);
      const { _id, title, content, shareImg, draft } = article;
      const newArticle = { _id, title, content, shareImg, draft };
      if (_id) {
        newArticleId = new ObjectID(_id);
        newArticle.updateDate = new Date();
      } else {
        newArticle.createDate = new Date();
      }
      if (draft === false) {
        newArticle.publishDate = new Date();
      }
      newArticle._id = newArticleId;
      await articleDao.newArticle(userId, newArticle);
      return { _id: newArticleId, draft };
    }
    return {};
  },
  markArticle: async (_, { articleId, mark }, context) => {
    let markRecord = {};
    const { user } = context.session;
    if (user && user._id) {
      const userId = new ObjectID(user._id);
      const markArticleId = new ObjectID(articleId);
      markRecord = await markDao.newUserMark(userId, markArticleId, mark);
    }
    return markRecord;
  },
};

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
    goodNumber: async (article, args, context, info) => {
      const { _id } = article;
      const goodNumber = goodDao.articleGoodNumber(_id);
      return goodNumber;
    },
    collectNumber: async (article, args, context, info) => {
      const { _id } = article;
      const collectNumber = await collectDao.articleCollectNumber(_id);
      return collectNumber;
    },
    commentNumber: async (article, args, context, info) => {
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
      const date = moment(publishDate).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      return date;
    },
    mark: async (article, args, context, info) => {
      const { user } = context.session;
      if (user && user._id) {
        const userId = new ObjectID(user._id);
        const markRecord = await markDao.userMark(userId, article._id);
        return markRecord.mark || false;
      }
      return false;
    },
  },
};

exports.Article = Article;
exports.ArticleQuery = ArticleQuery;
exports.ArticleMutation = ArticleMutation;
exports.ArticleResolver = ArticleResolver;
