const Koa = require('koa');
const KoaRouter = require('koa-router');
const koaBody = require('koa-bodyparser');
const { graphqlKoa, graphiqlKoa } = require('graphql-server-koa');
const config = require('config');
const cors = require('koa-cors');
const session = require('koa-session');
const winston = require('winston');
const logger = require('koa-logger');

const profile = require('./profile');
const schema = require('./schema');
const loggerMiddleware = require('./utils').loggerMiddleware;

const SERVER_CONFIG = config.get('server');

const fileRoot = config.get('profile.uploadPath');

const app = new Koa();
const router = new KoaRouter();


app.keys = ['everyone has a story'];

const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false,
};

app.use(logger());
app.use(loggerMiddleware);
app.use(session(CONFIG, app));

app.use(koaBody());
app.use(cors({
  credentials: true,
}));

router.post('/graphql', graphqlKoa((ctx) => {
  // console.log(ctx.logger);
  const graphqlKoaConfig = {
    schema,
    debug: process.env.NODE_ENV !== 'production',
    context: {
      session: ctx.session,
      ctx,
      logger: ctx.logger,
    },
  };
  return graphqlKoaConfig;
}));

router.get('/graphiql', graphiqlKoa(() => ({
  endpointURL: '/graphql',
})));

app.use(router.routes());
app.use(router.allowedMethods());
app.use(profile.routes()).use(profile.allowedMethods());

app.listen(SERVER_CONFIG.PORT, () => {
  winston.info(`${process.env.NODE_ENV}, server start at ${SERVER_CONFIG.PORT}, filePah: ${fileRoot}`);
});

