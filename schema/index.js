const { merge } = require('lodash');
const { makeExecutableSchema } = require('graphql-tools');

const { User, UserResolver, UserQuery } = require('./User');
const { Article, ArticleResolver, ArticleQuery } = require('./Article');

const RootQuery = `
  type Query {

    #Article query
    articles(_id: ID): [Article]
    article(_id: ID!): Article

    #User query
    user(_id: ID!): User
  }

`;

const SchemaDefinition = `
  schema {
    query: Query
  }
`;

const RootResolvers = {
  Query: merge(ArticleQuery, UserQuery),
}

module.exports = makeExecutableSchema({
  typeDefs: [ SchemaDefinition, RootQuery, Article, User ],
  resolvers: merge(RootResolvers, ArticleResolver, UserResolver),
});