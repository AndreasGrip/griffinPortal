const express = require('express');
const bcrypt = require('bcryptjs');
const mysqlConf = require('../agr_conf/mysql_config');
const Mysql = require('../agr_lib/mysql_lib');

const router = express.Router();
const db = new Mysql(mysqlConf);

const dbTable = '.users';

router.get('/', (req, res, next) => {
  res.render('userAdmin');
});

router.get('/get', (req, res, next) => {
  const sql = "select id, ifnull(userName,'') userName, firstName, lastName, email FROM " + mysqlConf.database + dbTable + ' where deactivated is null';

  db.query(sql)
    .then(data => {
      res.json(data[0]);
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
    req.query.valueToChange +
    '=' +
    db.escape(req.query.newValue) +
    ' where id = ' +
    db.escape(req.query.id) +
    ' and ' +
    req.query.valueToChange +
    " <> 'password'";

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
    .then(data => {
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

  if (
    req.query.userName === undefined ||
    req.query.firstName === undefined ||
    req.query.lastName === undefined ||
    req.query.email === undefined ||
    req.query.password === undefined
  ) {
    return 1;
  }

  const password = bcrypt.hashSync(db.escape(req.query.password), 10);
  const sql =
    'INSERT INTO ' +
    mysqlConf.database +
    dbTable +
    ' (userName, firstName, lastName, email, password) values (' +
    db.escape(req.query.userName) +
    ', ' +
    db.escape(req.query.firstName) +
    ', ' +
    db.escape(req.query.lastName) +
    ', ' +
    db.escape(req.query.email) +
    ', ' +
    db.escape(password) +
    ')';

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

router.get('/changePassword', (req, res, next) => {
  if (req.query.userId === undefined || req.query.password === undefined) {
    return 1;
  }
  if (/^.{0,6}$/u.test(db.escape(req.query.password))) {
    return 1;
  }

  const password = bcrypt.hashSync(req.query.password, 10);
  const sql = 'UPDATE ' + mysqlConf.database + dbTable + " set password = '" + password + "' WHERE id = " + db.escape(req.query.userId);

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
