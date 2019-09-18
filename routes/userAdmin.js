const express = require('express');
const bcrypt = require('bcryptjs');
const mysqlConf = require('../agr_conf/mysql_config');
const Mysql = require('../agr_lib/mysql_lib');

const router = express.Router();
const db = new Mysql(mysqlConf);

const dbTable = '.users';

function sqlQuery(sql,res) {
  db.query(sql)
    .then(data => {
      const result = data[0];
      res.status(200).json(result);
    })
    .catch(err => {
      res.status(400).end(err);
    });
}

router.get('/', (req, res, next) => {
  res.render('userAdmin');
});

router.get('/users', (req, res, next) => {
  //const sql = "select id, ifnull(userName,'') userName, firstName, lastName, email FROM " + mysqlConf.database + dbTable + ' where deactivated is null';
  // eslint-disable-next-line no-multi-str
  const sql = `select u.id, ifnull(u.userName,'') userName, u.firstName, u.lastName, u.email, concat('[', ifnull(group_concat(ua.name),''), ']') as access \
      FROM ${mysqlConf.database}${dbTable} u \
      left join ${mysqlConf.database}.user_useraccess uua on u.id = uua.userid \
      left join ${mysqlConf.database}.useraccess ua on ua.id = uua.useraccessid \
      where u.deactivated is null
      group by u.id`;

  sqlQuery(sql, res);
});

router.get('/useraccess', (req, res, next) => {
  const sql = 'select id, name from ' + mysqlConf.database + '.useraccess where deactivated is null order by name ';
  sqlQuery(sql, res);
});

router.patch('/useraccess/:userid', (req, res, next) => {
  if (req.params.userid === undefined || req.body.accesstochange === undefined || req.body.state === undefined) {
    return false;
  }

  let sql;
  if (req.body.state === 'true') {
    sql = 'insert into ' + mysqlConf.database + '.user_useraccess (userid, useraccessid) \
    select ' + db.escape(req.params.userid) + ',id from ' + mysqlConf.database + '.useraccess where name = ' + db.escape(req.body.accesstochange);
  } else {
    sql = 'delete uua from user_useraccess uua join useraccess ua on uua.useraccessid = ua.id \
    where uua.userid = ' + db.escape(req.params.userid) + ' and ua.name = ' + db.escape(req.body.accesstochange);
  }
  sqlQuery(sql, res);
});

router.patch('/users/:id', (req, res, next) => {
  if (req.params.id === undefined || req.body.valueToChange === undefined || req.body.newValue === undefined) {
    return false;
  }
  // if it's the password, a special set of rules and convert from plaintext to hashed format.
  if (req.body.valueToChange.toLowerCase() === 'password') {
    if (/^.{0,6}$/u.test(db.escape(req.body.newValue))) {
      return false;
    }
    req.body.newValue = bcrypt.hashSync(req.body.newValue, 10);
  }

  const sql = 'UPDATE ' + mysqlConf.database + dbTable + ' SET ' + req.body.valueToChange + '=' + db.escape(req.body.newValue) + ' where id = ' + db.escape(req.params.id);
  sqlQuery(sql, res);
});

router.delete('/users/:id', (req, res, next) => {
  if (req.params.id === undefined) {
    return false;
  }

  const sql = 'UPDATE ' + mysqlConf.database + dbTable + ' set deactivated = now() WHERE id = ' + db.escape(req.params.id);
  sqlQuery(sql, res);
});

router.post('/users', (req, res, next) => {
  if (req.body.userName === undefined || req.body.firstName === undefined || req.body.lastName === undefined || req.body.email === undefined || req.body.password === undefined) {
    return false;
  }

  const password = bcrypt.hashSync(db.escape(req.body.password), 10);
  const sql = 'INSERT INTO ' + mysqlConf.database + dbTable + ' (userName, firstName, lastName, email, password) values (' + db.escape(req.body.userName) + ', ' + db.escape(req.body.firstName) + ', ' + db.escape(req.body.lastName) + ', ' + db.escape(req.body.email) + ', ' + db.escape(password) + ')';
  sqlQuery(sql, res);
});

module.exports = router;
