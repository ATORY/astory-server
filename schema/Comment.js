const moment = require('moment');

const userDao = require('../dao/userDao');

const Comment = `
  type Comment {
    _id: ID
    content: String
    createDate: String
    user: User
  }
`;

const CommentQuery = {

};

const CommentResolver = {
  Comment: {
    createDate: (comment) => {
      const { createDate } = comment;
      const date = moment(createDate).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      return date;
    },
    user: async (comment) => {
      const { userId } = comment;
      const user = await userDao.getUser(userId);
      return user;
    },
  },
};

exports.Comment = Comment;
exports.CommentQuery = CommentQuery;
exports.CommentResolver = CommentResolver;
