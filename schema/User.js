const ObjectID = require('mongodb').ObjectID;

const articleDao = require('../dao/articleDao');
const userDao = require('../dao/userDao');
const collectDao = require('../dao/collectDao');
// const goodDao = require('../dao/goodDao');
const readDao = require('../dao/readDao');
const commentDao = require('../dao/commentDao');

const User = `
  type User {
    _id: ID
    email: String
    username: String
    userAvatar: String
    userIntro: String
    articles(articleId: ID): [Article]
    collects: [Collect]
    # goods: [Good]
    reads: [Read]
    comments: [Comment]
    isSelf: Boolean
  }

  input UserInput {
    email: String! 
    password: String! 
  }
  
  input UserUpdate {
    username: String
  }
`;

const UserQuery = {
  user: async (_, { _id }) => {
    const userId = new ObjectID(_id);
    const user = await userDao.getUser(userId);
    return user;
  },
  auth: (_, args, context) => (context.session.user || {}),
};

const UserMutation = {
  newUser: async (_, { user }, context) => {
    const { email, password } = user;
    const { session } = context;
    if (email && password) {
      const newUser = await userDao.createUser({ email, password });
      session.user = newUser;
      return newUser;
    }
    return {};
  },
  editUser: async (_, { username, userIntro, userAvatar }, context) => {
    const { session } = context;
    const { user } = session;
    if (user && user._id) {
      const userId = new ObjectID(user._id);
      const userInfo = await userDao.editUser(userId, username, userIntro, userAvatar);
      session.user = Object.assign({}, user, userInfo);
      return userInfo;
    }
    return {};
  },
};

const UserResolver = {
  User: {
    articles: async (user, args) => {
      const { _id } = user;
      const { articleId } = args;
      const articles = await articleDao.userArticles(_id, articleId);
      return articles;
    },
    collects: async (user) => {
      const { _id } = user;
      const collects = await collectDao.userCollects(_id);
      return collects;
    },
    // goods: async (user, args, context, info) => {
    //   const { _id } = user;
    //   const goods = await goodDao.userGoods(_id);
    //   return goods;
    // },
    reads: async (user) => {
      const { _id } = user;
      const reads = await readDao.userReads(_id);
      return reads;
    },

    comments: (user) => {
      const { _id } = user;
      const comments = commentDao.userComment(_id);
      return comments;
    },

    isSelf: (user, args, context) => {
      const { _id } = user;
      const sessionUser = context.session.user;
      const sessionUserId = sessionUser && sessionUser._id;
      return _id.toString() === sessionUserId;
    },
  },
};

exports.User = User;
exports.UserQuery = UserQuery;
exports.UserMutation = UserMutation;
exports.UserResolver = UserResolver;
