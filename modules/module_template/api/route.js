const router = require('express').Router();
const path = require('path');

router.use('/firstname', (req,res,next) => {
    res.end('John');
});

router.use('/lastname', (req,res,next) => {
    res.end('Doe');
});

router.get('/', (req, res, next) => {
    res.render(path.join(__dirname, 'index'));
  });

module.exports = router;