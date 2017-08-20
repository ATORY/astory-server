const ObjectID = require('mongodb').ObjectID;

const articleDao = require('../dao/articleDao');
const userDao = require('../dao/userDao');
const followDao = require('../dao/followDao');
const collectDao = require('../dao/collectDao');
const markDao = require('../dao/markDao');
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
    msg: String
    # 
    articles(articleId: ID, draft: Boolean): [Article]
    drafts(articleId: ID): [Article]
    # markArticles(articleId: ID): [Article]
    # collectArticles(articleId: ID): [Article]
    marks: [Mark]
    collects: [Collect]
    # goods: [Good]
    reads: [Read]
    comments: [Comment]
    isSelf: Boolean
    followed: Boolean
    followedNum: Int
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
      const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!emailReg.test(email)) {
        return {
          msg: '请使用合法的邮箱地址',
        };
      }
      if (password.length < 6) {
        return {
          msg: '密码长度不得小于6位',
        };
      }
      try {
        const newUser = await userDao.createUser({ email, password });
        session.user = newUser;
        return newUser;
      } catch (error) {
        return {
          msg: error.message,
        };
      }
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
  followUser: async (_, { userId, follow }, context) => {
    const { session } = context;
    const { user } = session;
    if (user && user._id) {
      const followedId = new ObjectID(user._id);
      const followId = new ObjectID(userId);
      const followedUser = await followDao.newUserFollow(followedId, followId, follow);
      return followedUser;
    }
    return {};
  },
};

const UserResolver = {
  User: {
    articles: async (user, args, context) => {
      const { _id } = user;
      const sessUser = context.session.user;
      const { articleId, draft = false } = args;
      if (draft) {
        if (sessUser && (sessUser._id === _id.toString())) {
          const articles = await articleDao.userArticles(_id, articleId, draft);
          return articles;
        }
        return [];
      }
      const articles = await articleDao.userArticles(_id, articleId, draft);
      return articles;
    },
    collects: async (user) => {
      const { _id } = user;
      const collects = await collectDao.userCollects(_id);
      return collects;
    },
    marks: async (user) => {
      const { _id } = user;
      const marks = await markDao.userMarks(_id);
      return marks;
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

    followed: async (user, args, context) => {
      const { _id, followed } = user;
      if (followed !== undefined) {
        return followed;
      }
      const sessionUser = context.session.user;
      const sessionUserId = sessionUser && sessionUser._id;
      if (!sessionUserId) return false;
      if (_id.toString() === sessionUserId) return true;
      const followId = _id;
      const userId = new ObjectID(sessionUserId);
      const result = await followDao.findFollow(userId, followId);
      return result;
    },

    followedNum: async (user) => {
      const { _id } = user;
      const number = await followDao.userFollowsNum(_id);
      return number;
    },
  },
};

exports.User = User;
exports.UserQuery = UserQuery;
exports.UserMutation = UserMutation;
exports.UserResolver = UserResolver;
