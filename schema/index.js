const { merge } = require('lodash');
const { makeExecutableSchema } = require('graphql-tools');

const { User, UserResolver, UserQuery, UserMutation } = require('./User');
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

const RootMutation = `
  type Mutation {
    newUser( email: String!, password: String! ): User
  }
`;


const SchemaDefinition = `
  schema {
    query: Query
    mutation: Mutation
  }
`;

const RootResolvers = {
  Query: merge(ArticleQuery, UserQuery),
  Mutation: merge(UserMutation),
}

module.exports = makeExecutableSchema({
  typeDefs: [ SchemaDefinition, RootQuery, RootMutation, Article, User ],
  resolvers: merge(RootResolvers, ArticleResolver, UserResolver),
});