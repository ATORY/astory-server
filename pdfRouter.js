const Router = require('koa-router');
const puppeteer = require('puppeteer');
const ObjectID = require('mongodb').ObjectID;
const config = require('config');

const articleDao = require('./dao/articleDao');

const Protocol = config.get('server.Protocol');
const HOST = config.get('server.HOST');

const router = new Router({
  prefix: '/pdf',
});

router.get('/:articleId', async (ctx) => {
  const { articleId } = ctx.params;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`${Protocol}//${HOST}/pdf/page/${articleId}`, { waitUntil: 'networkidle' });
  const pdf = await page.pdf({
    // path: 'hn.pdf',
    // displayHeaderFooter: true,
    printBackground: true,
    format: 'A5',
    margin: {
      top: '10mm',
      bottom: '10mm',
      right: '10mm',
      left: '10mm',
    },
  });
  browser.close();
  const pdfName = '599a8aa109979f26b368b476.pdf';
  ctx.set('Content-Type', 'application/pdf');
  ctx.set('Content-Disposition', `inline; filename=${pdfName}`);
  ctx.body = pdf;
});

router.get('/page/:articleId', async (ctx) => {
  const { articleId } = ctx.params;
  const host = ctx.headers.host;
  if (host !== HOST) {
    ctx.body = '';
    return;
  }
  const id = new ObjectID(articleId);
  const article = await articleDao.findArticle(id);
  const { content, title } = article;
  const html = `
    <html>
    <head>
      <title>${title}</title>
      <meta charset="utf-8">
      <meta name="viewport" content="initial-scale=1.0, width=device-width" class="next-head">
      <link rel='stylesheet' href='https://cdn.bootcss.com/highlight.js/9.12.0/styles/atom-one-dark.min.css' />
      <style>
        * {
          /*font-family: "Microsoft YaHei", Lyh-Regular, helvetica, arial, sans-serif;*/
          box-sizing: border-box;
        }
        p {
          margin: 10px 0;
        }
        .page {
          width: 700px;
          padding: 10px;
          margin: 0 auto;
        }
        .page img {
          width: 100%;
        }
        pre {
          background-color: #23241f;
          white-space: pre-wrap;
          margin-bottom: 5px;
          margin-top: 5px;
          padding: 5px 10px;
          color: #f8f8f2;
          overflow: visible;
          border-radius: 3px;
        }
      </style>
    </head>
    <body>
      <div class='ql-snow'>
        <div class='page ql-editor'>${content}</div>
      </div>
      <div style="page-break-before: always; page-break-after: always;" />
      <div class='ql-snow'>
        <div class='page ql-editor'>${content}</div>
      </div>
    </body>
    </html>
  `;
  ctx.res.end(html);
});

module.exports = router;
