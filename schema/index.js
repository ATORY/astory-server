const { merge } = require('lodash');
const { makeExecutableSchema } = require('graphql-tools');

const { Article, ArticleResolver } = require('./Article');
// const Comment = require('./Comment');

const { PGPool } = require('../db');

const RootQuery = `
  type Query {
    articles(): [Article]
    article(id: Int!): Article
  }
`;

const SchemaDefinition = `
  schema {
    query: Query
  }
`;

const RootResolvers = {
  Query: {
    article: async (_, { id }) => {
      const res = await PGPool.query('SELECT $1::text as message', ['Hello world!'])
      return {
        id: 1,
        title: 'title',
        content: 'content',
        author: res.rows[0].message,
      }
    }
  },
}

module.exports = makeExecutableSchema({
  typeDefs: [ SchemaDefinition, RootQuery, Article ],
  resolvers: merge(RootResolvers, ArticleResolver),
});