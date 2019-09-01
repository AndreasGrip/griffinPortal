/* eslint-disable no-restricted-syntax */
/* eslint-disable max-lines-per-function */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-console */
/* eslint-disable linebreak-style */
const express = require('express');
const bcrypt = require('bcryptjs');
const mysqlConf = require('../agr_conf/mysql_config');
const Mysql = require('../agr_lib/mysql_lib');

const router = express.Router();
const db = new Mysql(mysqlConf);

router.get('/bower_components/', (req, res, next) => {
  console.log('bower');
  next();
});

router.get('/logout/', (req, res, next) => {
  console.log('logout');
  req.session.destroy();
  res.redirect('../');
});

router.get('/login/', (req, res, next) => {
  console.log('login');
  if (req.session) {
    if (req.session.user !== undefined) {
      if (req.session.user.id !== undefined) {
        return res.redirect('../');
      }
    }
  }
  res.render('login');
});

router.post('/login/', (req, res, next) => {
  console.log('logpost');
  const query =
    'select id, userName, salt, password, firstName, lastName, email from ' + mysqlConf.database + '.users where email = ' + db.escape(req.body.email);

  db.query(query)
    .then(data => {
      if (data[0].length === 0) {
        console.log('No user found for user ', req.body.email);
      } else if (data[0].length > 1) {
        console.log('More than one match found for user ', req.body.email);
      } else if (bcrypt.compareSync(req.body.password, data[0][0].password)) {
        req.session.user = {};
        req.session.user = data[0][0];
        console.log('Correct password');
      } else {
        console.log('Wrong password');
      }
    })
    .then(() => {
      if (req.session.user) {
        const sql =
          'select URL, type from adminlte.useraccess where id in (select useraccessid from user_useraccess where userid = ' + req.session.user.id + ');';

        db.query(sql).then(data => {
          req.session.access = {};
          for (const acc of data[0]) {
            req.session.access[acc.URL] = acc.type;
          }
          res.redirect('../');
        });
      } else {
        res.redirect('../');
      }
    });
});

// Urls that start with login, dist, bower_components or plugins should not be checked for auth.
// eslint-disable-next-line max-lines-per-function
// eslint-disable-next-line max-statements
router.all(/^(?!.*bower_components|.*login|.*dist|.*plugins|.*stylesheets|.*javascripts).*$/u, (req, res, next) => {
  // console.log('root get ', req.url);
  if (req.session) {
    if (req.session.user === undefined) {
      return res.redirect('/login/');
    }
    if (req.session.user.id === undefined) {
      return res.redirect('/login/');
    }
    const url = {};

    url.org = req.path;
    url.path = '';
    url.type = '';
    let result = {};

    switch (true) {
      case !!/(^\/.+\/)(.*)/u.exec(req.path):
        result = req.path.match(/(^\/.*\/)(.*)/u);
        url.path = result[1];
        url.type = result[2];
        break;
      case !!/(^\/)(.*)/u.exec(req.path):
        result = req.path.match(/(^\/)(.*)/u);
        url.path = result[1];
        url.type = result[2];
        break;
      default:
        break;
    }
    if (req.session.access[url.path]) {
      if (req.session.access[url.path] === 'ALL') {
        next();
      } else {
        for (const type of req.session.access[url.path].split(',')) {
          // eslint-disable-next-line max-depth
          if (type === url.type) {
            next();
          }
        }

        return res.redirect('/login/');
      }
    } else {
      return res.redirect('/login/');
    }
  } else {
    next();
  }
});

module.exports = router;
