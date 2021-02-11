const express = require('express');
const bcrypt = require('bcryptjs');
const mysqlConf = require('../agr_conf/mysql_config');
const Mysql = require('../agr_lib/mysql_lib');

const router = express.Router();
const db = new Mysql(mysqlConf);

router.get('/bower_components/', (req, res, next) => {
  next();
});

router.get('/logout/', (req, res, next) => {
  console.log('logout');
  req.session.destroy();
  res.redirect('../');
});

router.get('/login/', (req, res, next) => {
  if (req.session && req.session.user !== undefined && req.session.user.id !== undefined) {
    return res.redirect('../');
  } else {
    console.log('login' + req.session.user);
    res.render('login', {});
  }
});

router.post('/login/', (req, res, next) => {
  console.log('logpost');
  const query = 'select id, userName, salt, password, firstName, lastName, email from ' + mysqlConf.database + '.users where (email = ' + db.escape(req.body.email) + ' or userName = ' + db.escape(req.body.email) + ') and deactivated is null';

  db.query(query)
    .then((data) => {
      if (data[0].length === 0) {
        throw new Error('No user found for user ' + req.body.email);
      } else if (data[0].length > 1) {
        throw new Error('More than one match found for user ' + req.body.email);
      } else if (bcrypt.compareSync(req.body.password, data[0][0].password)) {
        req.session.user = {};
        req.session.user = data[0][0];
        if (!req.session.user.id) {
          throw new Error('Failed to init user (userid missing), contact administrator. User: ' + req.body.email);
        }
      } else {
        throw new Error('Wrong password ' + req.body.email);
      }
    })
    // get the accesslevels for the user from database
    .then(() => {
      const sql = 'select URL, type from adminlte.useraccess where id in (select useraccessid from user_useraccess where userid = ' + req.session.user.id + ');';
      return db.query(sql);
    })
    // When the sql is done add the users accesslevels to his/her session.
    .then((data) => {
      req.session.access = {};
      for (const acc of data[0]) {
        req.session.access[acc.URL] = acc.type;
      }
    })
    // get the settings for the user from database
    .then(() => {
      const sql = 'select udt.name, ud.value from adminlte.userdata ud join adminlte.userdatatypes udt on udt.id = ud.userdatatypeid where ud.userid = ' + req.session.user.id;
      return db.query(sql);
    })
    // When the sql is done add the users settings to his/her session.
    .then((data) => {
      req.session.settings = {};
      for (const setting of data[0]) {
        req.session.settings[setting.name] = setting.value;
      }
    })
    .then(() => {
      res.redirect('../');
    })
    .catch((err) => {
      res.render('login', { error: err });
      //res.status(503);
      //res.render('error', { error: err });
    });
});

// Urls that start with login, dist, bower_components or plugins should not be checked for auth.
// eslint-disable-next-line max-lines-per-function
// eslint-disable-next-line max-statements
router.all(/^(?!.*bower_components|.*login|.*dist|.*plugins|.*stylesheets|.*javascripts).*$/u, (req, res, next) => {
  // console.log('root get ', req.url);
  if (req.session) {
    if (req.session.user === undefined || !req.session.user.id) {
      return res.redirect('/login/');
    }
    const url = {};

    url.org = req.path;
    url.path = '';
    url.type = '';
    let result = {};

    switch (true) {
      case !!/(^\/\w+\/)(\w*)/u.exec(req.path):
        result = req.path.match(/(^\/\w*\/)(\w*)/u);
        url.path = result[1];
        url.type = result[2];
        break;
      case !!/(^\/)(\w*)/u.exec(req.path):
        result = req.path.match(/(^\/)(\w*)/u);
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
