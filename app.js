const Koa = require('koa');
const KoaRouter = require('koa-router');
const koaBody = require('koa-bodyparser');
const { graphqlKoa, graphiqlKoa } = require('graphql-server-koa');
const config = require('config');
const cors = require('koa-cors');
const session = require('koa-session');
const winston = require('winston');
// const logger = require('koa-logger');
const Prometheus = require('prom-client');
const PrometheusGCStats = require('prometheus-gc-stats');

const OpticsAgent = require('optics-agent');

const pwdRouter = require('./pwdRouter');
const pdfRouter = require('./pdfRouter');
const profile = require('./profile');
const schema = require('./schema');
const loggerMiddleware = require('./utils').loggerMiddleware;

const SERVER_CONFIG = config.get('server');

const fileRoot = config.get('profile.uploadPath');

const app = new Koa();
const router = new KoaRouter();

const isProd = process.env.NODE_ENV === 'production';

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

if (isProd) {
  OpticsAgent.configureAgent({
    apiKey: 'service:Tonyce-astory:gNVabfR0gKixJktHxbIvgw',
  });
  OpticsAgent.instrumentSchema(schema);
  app.use(OpticsAgent.koaMiddleware());
}

// app.use(logger());
app.use(loggerMiddleware);
app.use(session(CONFIG, app));

app.use(koaBody());
app.use(cors({
  credentials: true,
}));

/**
 * monitor
 */
const collectDefaultMetrics = Prometheus.collectDefaultMetrics;
const Registry = Prometheus.Registry;
const register = new Registry();

collectDefaultMetrics({ register });
PrometheusGCStats(register)();

router.get('/metrics', (ctx) => {
  ctx.set('Content-Type', Prometheus.register.contentType);
  ctx.body = register.metrics();
});
/** monitor up */

router.post('/graphql', graphqlKoa((ctx) => {
  const graphqlKoaConfig = {
    schema,
    debug: !isProd,
    context: {
      session: ctx.session,
      ctx,
      logger: ctx.logger,
    },
  };
  if (isProd) {
    const opticsContext = OpticsAgent.context(ctx.request);
    graphqlKoaConfig.context.opticsContext = opticsContext;
  }
  return graphqlKoaConfig;
}));

router.get('/graphiql', graphiqlKoa(() => ({
  endpointURL: '/graphql',
})));

app.use(router.routes());
app.use(router.allowedMethods());
app.use(profile.routes()).use(profile.allowedMethods());
app.use(pwdRouter.routes()).use(pwdRouter.allowedMethods());
app.use(pdfRouter.routes()).use(pdfRouter.allowedMethods());

app.listen(SERVER_CONFIG.PORT, () => {
  winston.info(`${process.env.NODE_ENV}, server start at ${SERVER_CONFIG.PORT}, filePah: ${fileRoot}`);
});

