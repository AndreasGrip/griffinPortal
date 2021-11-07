const router = require('express').Router();
const path = require('path');
const fs = require('fs');

fs.readdirSync(__dirname, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .forEach((folder) => {
    if (fs.existsSync(path.join(__dirname, folder.name, 'route.js'))) {
      console.log('Loading module from ' + path.join(__dirname, folder.name, 'route.js'));
      router.use('/' + folder.name, require(path.join(__dirname, folder.name, 'route.js')));
    } else {
      console.warn('Cant load module from ' + path.join(__dirname, folder.name) + ' as route.js is not available.');
    }
  });

router.get('/firstname', (req, res, next) => {
  res.end('John');
});

router.get('/lastname', (req, res, next) => {
  res.end('Doe');
});

router.get('/:id(\\d+)?', (req, res, next) => {
  const baseURL = 'http://' + req.headers.host + '/';
  const reqUrl = new URL(req.url, baseURL);
  const queryRaw = reqUrl.search;
  let pageToRender;

  // Replaces router.get('/' .... if so we should render index.pug
  if (reqUrl.search === '' && req.params.path === undefined) {
    pageToRender = 'index';
  } else {
    pageToRender = req.params.path;
  }

  res.render(path.join(__dirname, pageToRender));
});
module.exports = router;
