const koa = require('koa');
const koaRouter = require('koa-router');
const koaBody = require('koa-bodyparser');
const { graphqlKoa, graphiqlKoa } = require('graphql-server-koa');
const { makeExecutableSchema } = require('graphql-tools');
const config = require('config');
const cors = require('koa-cors');

const schema = require('./schema');
const { PGPool } = require('./db');

const SERVER_CONFIG = config.get('server');

const app = new koa();
const router = new koaRouter();
const PORT = 3000;

app.use(koaBody())
app.use(cors());

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

app.listen(SERVER_CONFIG.PORT, () => {
  console.log(`server start at ${SERVER_CONFIG.PORT}`);
});

