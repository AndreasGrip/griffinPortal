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
  console.log('logout ');
  req.session.destroy();
  res.redirect('../');
});

router.get('/login/', (req, res, next) => {
  if (req.session && req.session.user !== undefined && req.session.user.id !== undefined) {
    return res.redirect('../');
  } else {
    res.render('login', {});
  }
});

router.post('/login/', (req, res, next) => {
  const query = 'select id, userName, salt, password, firstName, lastName, email from ' + mysqlConf.database + '.users where (email = ' + db.escape(req.body.email) + ' or userName = ' + db.escape(req.body.email) + ') and deactivated is null';

  db.query(query)
    .then((data) => {
      if (data[0].length === 0) {
        throw new Error('No user found for user ' + req.body.email);
      } else if (data[0].length > 1) {
        throw new Error('More than one match found for user ' + req.body.email);
      } else if (bcrypt.compareSync(req.body.password, data[0][0].password)) {
        req.session.user = data[0][0];
        if (!req.session.user.id) {
          throw new Error('Failed to init user (userid missing), contact administrator. User: ' + req.body.email);
        }
        console.log('User ' + req.body.email + ' logged in.');
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
      // res.status(503);
      // res.render('error', { error: err });
    });
});

// Urls that start with login, dist, bower_components or plugins should not be checked for auth.
// eslint-disable-next-line max-lines-per-function
// eslint-disable-next-line max-statements
router.all(/^(?!.*bower_components|.*login|.*dist|.*plugins|.*stylesheets|.*javascripts).*$/u, (req, res, next) => {
  // console.log('root get ', req.url);
  if (req?.session?.user?.id !== undefined) {
    const newUrl = new URL(req.protocol + '://' + req.hostname + req.url);
    // what access rules match this url?
    const accessMatch = Object.keys(req.session.access).filter((key) => new RegExp('^' + key).exec(newUrl.pathname));
    // if no access rules match this url, redirect to /login/
    if (accessMatch.length > 0) {
      // Sort the matches and put the longest match on the top.
      accessMatch.sort((a, b) => b.length - a.length);
      // use the match on top as "bestMatch"
      let bestMatch = accessMatch.shift();
      // extract the types from the "bestMatch", and create an array by splitting by ',' after removing any spaces.
      const bestMatchType = req.session.access[bestMatch] ? req.session.access[bestMatch].replace(' ').split(',') : [];
      // add a trailing slash if there is none. (there should be)
      if (bestMatch.slice(-1) !== '/') bestMatch += '/';
      // rename the part that is the match from the url, the rest should be the type
      const type = newUrl.pathname.replace(new RegExp('^' + bestMatch), '');
      // the type should be the part after the last slash, if there is still a slash then it's a bad match
      if (type.search('/') >= 0 && bestMatch === '/') {
        console.debug('Best match is root, bug type contains /, access to "home" dont give access to all. pathname: ' + newUrl.pathname + ', bestMatch: ' + bestMatch + ', type: ' + type);
      } else if (bestMatchType.find((accType) => accType.toLowerCase() === 'all')) {
        console.debug('Type all found on pathname: ' + newUrl.pathname + ', bestMatch: ' + bestMatch + ', type: ' + type);
        return next();
      } else if (bestMatchType.find((accType) => accType.toLowerCase() === type.toLowerCase())) {
        console.debug('Type exact match found on pathname: ' + newUrl.pathname + ', bestMatch: ' + bestMatch + ', type: ' + type);
        return next();
      } else {
        console.debug('No match found on pathname: ' + newUrl.pathname);
      }
    }
  } else {
    // Session seem broken, so destroy it.
    req.session.destroy();
  }
  return res.redirect('/login/');
});

module.exports = router;
