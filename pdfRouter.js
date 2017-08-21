const Router = require('koa-router');
const puppeteer = require('puppeteer');
const ObjectID = require('mongodb').ObjectID;

const articleDao = require('./dao/articleDao');

const router = new Router({
  prefix: '/pdf',
});

router.get('/', async (ctx) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4000/pdf/page', { waitUntil: 'networkidle' });
  const pdf = await page.pdf({
    // path: 'hn.pdf',
    // displayHeaderFooter: true,
    printBackground: true,
    format: 'A4',
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

router.get('/page', async (ctx) => {
  const articleId = new ObjectID('599a8aa109979f26b368b476');
  const article = await articleDao.findArticle(articleId);
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
          box-sizing: border-box;
        }
        p {
          margin: 10px 0;
        }
        .page {
          width: 8.27in;
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
