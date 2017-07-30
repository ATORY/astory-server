const koa = require('koa');
const koaRouter = require('koa-router');
const koaBody = require('koa-bodyparser');
const { graphqlKoa, graphiqlKoa } = require('graphql-server-koa');
const { makeExecutableSchema } = require('graphql-tools');

const schema = require('./schema');
const { PGPool } = require('./db');

const app = new koa();
const router = new koaRouter();
const PORT = 3000;

app.use(koaBody())

router.post('/graphql', graphqlKoa({
  schema
}));

router.get('/graphiql', graphiqlKoa({ 
  endpointURL: '/graphql',
  debug: true,
  // context: { user: request.session.user }
}));

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log('server start ')
});

