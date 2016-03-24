/* eslint no-console: 0 */
// Filename: server.js  
// Timestamp: 2016.03.24-00:45:29 (last modified)
// Author(s):
//
// generated from
// https://github.com/christianalfoni/webpack-express-boilerplate

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');
const serveIndex = require('serve-index');

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;
const app = express();

if (isDeveloping) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));

  app.get('/', (req, res) => {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end();
  });

  // make source files navigable
  app.use('/app', express.static(__dirname + '/app'));
  app.use('/app', serveIndex('app', {icons : true}));

  app.post('/save', (req, res) => {
    console.log(req.body);
  });

  app.put('/save', (req, res) => {
    const data = req.query && req.query.data;
    console.log('data is', data);

    res.sendStatus(200);
  });    
  
} else {
  app.use(express.static(__dirname + '/dist'));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) console.log(err);

  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
