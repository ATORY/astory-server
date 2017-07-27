// Article.js

const Comment = require('./comment');

const Article = `
  type Article {
    id: Int!
    title: String
    content: String
    author: String
    # comments: [Comment]
  }
`;

const ArticleResolver = {
  Article: {
    id: () => 1,
    title: () => 'title',
    content: () => 'content',
    author: () => 'author'
  }
}

module.exports = {
  Article,
  ArticleResolver
};