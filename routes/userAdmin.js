/* eslint-disable no-multi-str */
const express = require('express');
const bcrypt = require('bcryptjs');
const mysqlConf = require('../agr_conf/mysql_config');
const Mysql = require('../agr_lib/mysql_lib');

const router = express.Router();
const db = new Mysql(mysqlConf);

const dbTable = '.users';

function sqlQuery(sql, res) {
  db.query(sql)
    .then((data) => {
      const result = data[0];
      res.status(200).json(result);
    })
    .catch((err) => {
      const errorMsg = err.message ? err.message : JSON.stringify(err);
      res.status(400).end(errorMsg);
    });
}

router.get('/', (req, res, next) => {
  res.render('base', { pageToRender: 'userAdmin', label: 'userAdmin', path: 'userAdmin/' });
});

router.get('/list', (req, res, next) => {
  const sql = `select u.id, ifnull(u.userName,'') userName, u.firstName, u.lastName, u.email, concat('[', ifnull(group_concat(ua.name),''), ']') as access \
      FROM ${mysqlConf.database}${dbTable} u \
      left join ${mysqlConf.database}.user_useraccess uua on u.id = uua.userid \
      left join ${mysqlConf.database}.useraccess ua on ua.id = uua.useraccessid \
      where u.deactivated is null
      group by u.id`;

  sqlQuery(sql, res);
});

router.patch('/:id', (req, res, next) => {
  if (req.params.id === undefined || req.body.valueToChange === undefined || req.body.newValue === undefined) {
    res.status(400).end();
    return false;
  }
  // what value should be possible to change.
  switch (req.body.valueToChange) {
    case 'userName':
    case 'firstName':
    case 'lastName':
    case 'password':
    case 'email':
      break;
    default:
      res.status(401).end();
      return false;
  }

  // if it's the password, a special set of rules and convert from plaintext to hashed format.
  if (req.body.valueToChange.toLowerCase() === 'password') {
    if (/^.{0,6}$/u.test(db.escape(req.body.newValue))) {
      res.status(400).end();
      return false;
    }
    req.body.newValue = bcrypt.hashSync(req.body.newValue, 10);
  }

  const sql =
    'UPDATE ' +
    mysqlConf.database +
    dbTable +
    ' SET ' +
    req.body.valueToChange +
    '=' +
    db.escape(req.body.newValue) +
    ' where id = ' +
    db.escape(req.params.id);
  sqlQuery(sql, res);
});

router.delete('/:id', (req, res, next) => {
  if (req.params.id === undefined) {
    res.status(400).end();
    return false;
  }

  const sql = 'UPDATE ' + mysqlConf.database + dbTable + ' set deactivated = now() WHERE id = ' + db.escape(req.params.id);
  sqlQuery(sql, res);
});

router.post('/', (req, res, next) => {
  if (
    req.body.userName === undefined ||
    req.body.firstName === undefined ||
    req.body.lastName === undefined ||
    req.body.email === undefined ||
    req.body.password === undefined
  ) {
    res.status(400).end();
    return false;
  }

  const password = bcrypt.hashSync(req.body.password, 10);
  const sql =
    'INSERT INTO ' +
    mysqlConf.database +
    dbTable +
    ' (userName, firstName, lastName, email, password) values (' +
    db.escape(req.body.userName) +
    ', ' +
    db.escape(req.body.firstName) +
    ', ' +
    db.escape(req.body.lastName) +
    ', ' +
    db.escape(req.body.email) +
    ', ' +
    db.escape(password) +
    ')';
  sqlQuery(sql, res);
});

router.get('/useraccess', (req, res, next) => {
  const sql = 'select id, name from ' + mysqlConf.database + '.useraccess where deactivated is null order by name ';
  sqlQuery(sql, res);
});

router.patch('/useraccess/:userid', (req, res, next) => {
  if (req.params.userid === undefined || req.body.valueToChange === undefined || req.body.newValue === undefined) {
    res.status(400).end();
    return false;
  }

  let sql;
  if (req.body.newValue === 'true') {
    sql =
      'insert into ' +
      mysqlConf.database +
      '.user_useraccess (userid, useraccessid) \
    select ' +
      db.escape(req.params.userid) +
      ',id from ' +
      mysqlConf.database +
      '.useraccess where name = ' +
      db.escape(req.body.valueToChange);
  } else {
    sql =
      'delete uua from user_useraccess uua join useraccess ua on uua.useraccessid = ua.id \
    where uua.userid = ' +
      db.escape(req.params.userid) +
      ' and ua.name = ' +
      db.escape(req.body.valueToChange);
  }
  sqlQuery(sql, res);
});

module.exports = router;
