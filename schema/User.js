const ObjectID = require('mongodb').ObjectID;

const articleDao = require('../dao/articleDao');
const userDao = require('../dao/userDao');
const collectDao = require('../dao/collectDao');
const goodDao = require('../dao/goodDao');
const readDao = require('../dao/readDao');

const User = `
  type User {
    _id: ID!
    email: String!
    username: String
    articles(articleId: ID): [Article]
    collects: [Collect]
    goods: [Good]
    reads: [Read]
  }
`

const UserQuery = {
  user: async (_, { _id }) => {
    const userId = new ObjectID(_id);
    const user = await userDao.getUser(userId);
    return user;
  }
}

const UserMutation = {
  newUser: async (_, { email, password }) => {
    const user = await userDao.createUser({email, password});
    return user;
  }
}

const UserResolver = {
  User: {
    articles: async (user, args, context, info) => {
      const { _id } = user;
      const { articleId } = args;
      const articles = await articleDao.userArticles(_id, articleId);
      return articles;
    },
    collects: async (user, args, context, info) => {
      const { _id } = user;
      const collects = await collectDao.userCollects(_id);
      return collects;
    },
    goods: async (user, args, context, info) => {
      const { _id } = user;
      const goods = await goodDao.userGoods(_id);
      return goods;
    },
    reads: async (user, args, context, info) => {
      const { _id } = user;
      const reads = await readDao.userReads(_id);
      return reads;
    },
  }
}

exports.User = User;
exports.UserQuery = UserQuery;
exports.UserMutation = UserMutation;
exports.UserResolver = UserResolver;