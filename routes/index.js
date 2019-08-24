const express = require('express');
const mysqlConf = require('../agr_conf/mysql_config');
const Mysql = require('../agr_lib/mysql_lib');

const router = express.Router();
const db = new Mysql(mysqlConf);

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
  //  res.render('index', { title: 'Express' });
});

router.get('/sidebar', (req, res, next) => {
  const sql =
    'select description, URL, icon  from adminlte.useraccess where id in (select useraccessid from user_useraccess where userid = ' +
    req.session.user.id +
    ') order by sortorder';
  db.query(sql)
    .then(result => {
      res.json(result[0]);
    })
    .catch(err => {
      res.json(err);
    });
});

module.exports = router;
