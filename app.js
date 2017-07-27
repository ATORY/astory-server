const koa = require('koa')
const koaRouter = require('koa-router')
const koaBody = require('koa-bodyparser')
const { graphqlKoa, graphiqlKoa } = require('graphql-server-koa')
const { makeExecutableSchema } = require('graphql-tools');

const schema = require('./schema');
const { PGPool } = require('./db');

const app = new koa();
const router = new koaRouter();
const PORT = 3000;

app.use(koaBody())
router.post('/graphql', graphqlKoa({
  schema
}))

router.get('/graphql', graphqlKoa({ 
  schema: schema
}))

router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }));

app.use(router.routes());
app.use(router.allowedMethods());

(async () => {
  // await pgClient.connect()
  const client = await PGPool.connect();
  try {
    const res = await PGPool.query('SELECT $1::text as message', ['Hello world!'])
    console.log(res.rows[0].message) // Hello world!  
  }finally {
    app.listen(PORT);
    client.release()
  }
  
})().catch(e => console.log(e.stack));
