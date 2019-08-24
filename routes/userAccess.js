const express = require('express');
const mysqlConf = require('../agr_conf/mysql_config');
const Mysql = require('../agr_lib/mysql_lib');

const router = express.Router();
const db = new Mysql(mysqlConf);

const dbTable = '.useraccess';

router.get('/', (req, res, next) => {
  res.render('userAccess');
});

router.get('/get', (req, res, next) => {
  const sql = 'select id, name, description, URL, type, icon, sortorder FROM ' + mysqlConf.database + dbTable + ' where deactivated is null';

  db.query(sql)
    .then(data => {
      const result = data[0];
      res.json(result);
    })
    .catch(err => {
      res.json({
        result: 'Error',
        message: err.message
      });
    });
});

router.get('/set', (req, res, next) => {
  if (req.query.id === undefined || req.query.valueToChange === undefined || req.query.newValue === undefined) {
    return 1;
  }

  const sql =
    'UPDATE ' +
    mysqlConf.database +
    dbTable +
    ' SET ' +
    db.escape(req.query.valueToChange) +
    "='" +
    db.escape(req.query.newValue) +
    "' where id = " +
    db.escape(req.query.id);

  db.query(sql)
    .then(() => {
      res.json({
        result: 'Ok'
      });
    })
    .catch(err => {
      res.json({
        result: 'Error',
        message: err.message
      });
    });
});

router.get('/del', (req, res, next) => {
  if (req.query.id === undefined) {
    return 1;
  }
  const sql = 'UPDATE ' + mysqlConf.database + dbTable + ' set deactivated = now() WHERE id = ' + db.escape(req.query.id);

  db.query(sql)
    .then(() => {
      res.json({
        result: 'Ok'
      });
    })
    .catch(err => {
      res.json({
        result: 'Error',
        message: err.message
      });
    });
});

router.get('/add', (req, res, next) => {
  // Required fields
  if (req.query.name === undefined || req.query.URL === undefined || req.query.type === undefined || req.query.description === undefined) {
    return 1;
  }
  const sql =
    'INSERT INTO ' +
    mysqlConf.database +
    dbTable +
    " (name, description, URL, type) values ('" +
    db.escape(req.query.name) +
    "', '" +
    db.escape(req.query.description) +
    "', '" +
    db.escape(req.query.URL) +
    "', '" +
    db.escape(req.query.type) +
    "')";

  db.query(sql)
    .then(() => {
      res.json({
        result: 'Ok'
      });
    })
    .catch(err => {
      res.json({
        result: 'Error',
        message: err.message
      });
    });
});

module.exports = router;
