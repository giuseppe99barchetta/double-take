const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { UI } = require('./constants')();
const ipfilter = require('express-ipfilter').IpFilter;

require('express-async-errors');

const app = express();

app.use('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(require('./middlewares/respond'));

if (process.env.HA_ADDON === 'true' && process.env.IPFILTER === 'true') {
  const ips = ['172.30.32.2', '127.0.0.1', '::ffff:172.30.32.2', '::ffff:127.0.0.1'];
  app.use(ipfilter(ips, { mode: 'allow' }));
}
app.use(
  UI.PATH,
  express.static(`./frontend/${process.env.NODE_ENV === 'development' ? 'dist/' : ''}`, {
    index: false,
  })
);

app.get(`${UI.PATH}/api/openapi.json`, (req, res) => {
  res.sendFile(path.resolve(__dirname, '../openapi.json'));
});

app.get(`${UI.PATH}/api/docs`, (req, res) => {
  const openapiPath = `${UI.PATH || ''}/api/openapi.json`;
  res.send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Double Take API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #f7f7f8; }
      #swagger-ui { max-width: 1200px; margin: 0 auto; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '${openapiPath}',
        dom_id: '#swagger-ui'
      });
    </script>
  </body>
</html>`);
});

app.use(`${UI.PATH}/api`, require('./routes'));

app.use(UI.PATH, (req, res) => {
  const html = fs.readFileSync(
    `${process.cwd()}/frontend/${process.env.NODE_ENV === 'development' ? 'dist/' : ''}index.html`,
    'utf8'
  );
  res.send(
    html.replace(
      '</head>',
      `<script>
        window.ingressUrl = '${req.headers['x-ingress-path'] || ''}';
        window.publicPath = '${UI?.PATH || ''}';
      </script>
      </head>`
    )
  );
});

module.exports = app;
