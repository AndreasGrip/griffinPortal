const router = require('express').Router();
const path = require('path');
const fs = require('fs');

fs.readdirSync(__dirname, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .forEach((folder) => {
    if (fs.existsSync(path.join(__dirname, folder.name, 'route.js'))) {
      console.log('Loading module from ' + path.join(__dirname, folder.name, 'route.js'))
      router.use('/' + folder.name, require(path.join(__dirname, folder.name, 'route.js')));
    }
  });

router.use('/secret', (req, res, next) => {
  res.end('Nothing to se here, please go away!');
});
router.get('/', (req, res, next) => {
  res.render(path.join(__dirname, 'index'));
});
// etc.

module.exports = router;
