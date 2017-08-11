const { merge } = require('lodash');
const { makeExecutableSchema } = require('graphql-tools');

const { User, UserResolver, UserQuery, UserMutation } = require('./User');
const { Article, ArticleResolver, ArticleQuery, ArticleMutation } = require('./Article');
// const { ArticleOprateTime } = require('./ArticleOprateTime')
const { Comment, CommentQuery, CommentResolver } = require('./Comment');
const { Good, GoodQuery, GoodResolver } = require('./Good');
const { Mark, MarkQuery, MarkResolver } = require('./Mark');
const { Collect, CollectQuery, CollectResolver } = require('./Collect');
const { Read, ReadQuery, ReadResolver } = require('./Read');

const RootQuery = `
  type Query {
    
    # Article query
    articles(_id: ID): [Article]
    article(_id: ID!): Article

    # User query
    auth: User
    user(_id: ID!): User
  }
`;

const RootMutation = `
  type Mutation {
    newUser( user: UserInput!): User
    editUser( username: String!, userIntro: String, userAvatar: String): User
    newArticle( article: ArticleInput!): Article
    markArticle( articleId: String!, mark: Boolean!): Mark
    collectArticle( articleId: String!, collect: Boolean!): Collect
    newArticleComment( articleId: String!, content: String!, originCommentId: String ): Comment
    delArticle(articleId: String!): Article
    # newComment(): Comment
    # newGood(): Good
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
    CollectQuery, ReadQuery, MarkQuery,
  ),
  Mutation: merge(UserMutation, ArticleMutation),
};

module.exports = makeExecutableSchema({
  typeDefs: [
    SchemaDefinition, RootQuery, RootMutation, Article,
    User, Comment, Good, Collect, Read, Mark,
  ],
  resolvers: merge(
    RootResolvers, ArticleResolver, UserResolver, CommentResolver, GoodResolver,
    CollectResolver, ReadResolver, MarkResolver,
  ),
});
