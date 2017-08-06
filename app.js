const koa = require('koa');
const koaRouter = require('koa-router');
const koaBody = require('koa-bodyparser');
const { graphqlKoa, graphiqlKoa } = require('graphql-server-koa');
const { makeExecutableSchema } = require('graphql-tools');
const config = require('config');
const cors = require('koa-cors');
const session = require('koa-session');

const schema = require('./schema');
const { PGPool } = require('./db');

const SERVER_CONFIG = config.get('server');

const app = new koa();
const router = new koaRouter();
const PORT = 3000;

app.keys = ['some secret hurr'];

const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false **/
};

app.use(session(CONFIG, app));

app.use(koaBody())
app.use(cors({
  credentials: true
}));

router.post('/graphql', graphqlKoa((ctx) => ({
  schema,
  debug: true,
  context: { 
    session: ctx.session,
    ctx
  }
})));

router.get('/graphiql', graphiqlKoa( ctx => { 
  endpointURL: '/graphql'
}));

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(SERVER_CONFIG.PORT, () => {
  console.log(`server start at ${SERVER_CONFIG.PORT}`);
});

