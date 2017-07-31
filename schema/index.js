const { merge } = require('lodash');
const { makeExecutableSchema } = require('graphql-tools');

const { User, UserResolver, UserQuery, UserMutation } = require('./User');
const { Article, ArticleResolver, ArticleQuery } = require('./Article');
// const { ArticleOprateTime } = require('./ArticleOprateTime')
const { Comment, CommentQuery, CommentResolver } = require('./Comment');
const { Good, GoodQuery, GoodResolver } = require('./Good');
const { Collect, CollectQuery, CollectResolver } = require('./Collect');
const { Read, ReadQuery, ReadResolver } = require('./Read');

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
  Query: merge(
    ArticleQuery, UserQuery, CommentQuery, GoodQuery,
    CollectQuery, ReadQuery
  ),
  Mutation: merge(UserMutation),
}

module.exports = makeExecutableSchema({
  typeDefs: [ 
    SchemaDefinition, RootQuery, RootMutation, Article,
    User, Comment, Good, Collect, Read 
  ],
  resolvers: merge(
    RootResolvers, ArticleResolver, UserResolver, CommentResolver, GoodResolver, 
    CollectResolver, ReadResolver
  ),
});