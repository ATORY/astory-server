const articleDao = require('../dao/articleDao').getService();
const userDao = require('../dao/userDao').getService();

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
      const articles = await articleDao.userArticles(_id);
      return articles;
    }
  }
}

exports.User = User;
exports.UserQuery = UserQuery;
exports.UserMutation = UserMutation;
exports.UserResolver = UserResolver;