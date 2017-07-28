const articleDao = require('../dao/articleDao').getService();
const userDao = require('../dao/userDao').getService();

const UserSchema = {
  email: null, // *unique
  password: null,
  username: null,
  userAvatar: '',
  sign: '',
  wechatPay: '',
  aliPay: '',
  follow: 0,
  banner: '',
  createDate: new Date(),
  lastUpdate: new Date(),
  lastLogin: new Date(),
};

const User = `
  type User {
    _id: ID!
    email: String!
    username: String
    articles: [Article]
  }
`

const UserQuery = {
  user: async (_, { _id }) => {
    const user = await userDao.getUser(_id)
    return []
  }
}

const UserResolver = {
  User: {
    articles: async (user, args, context, info) => {
      const { _id } = user;
      const articles = await articleDao.userArticles(_id);
      return articles;
    }
  }
}

exports.User = User;
exports.UserQuery = UserQuery;
exports.UserResolver = UserResolver;
exports.UserSchema = UserSchema;