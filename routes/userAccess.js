const express = require('express');
const mysqlConf = require('../agr_conf/mysql_config');
const Mysql = require('../agr_lib/mysql_lib');

const router = express.Router();
const db = new Mysql(mysqlConf);

const dbTable = '.useraccess';

function sqlQuery(sql) {
  db.query(sql)
    .then(data => {
      const result = data[0];
      res.status(200).json(result);
    })
    .catch(err => {
      res.status(404).end();
    });

}

router.get('/', (req, res, next) => {
  res.render('userAccess');
});

router.get('/userAccess', (req, res, next) => {
  const sql = 'select id, name, description, URL, type, icon, sortorder FROM ' + mysqlConf.database + dbTable + ' where deactivated is null';
  sqlQuery(sql);
});

router.patch('/userAccess/:id', (req, res, next) => {
  if (req.body.id === undefined || req.body.valueToChange === undefined || req.body.newValue === undefined) {
    return false;
  }

  switch (req.body.valueToChange) {
    case 'name':
    case 'description':
    case 'URL':
    case 'type':
    case 'icon':
      break;
    default:
      return false;
  }

  const sql = 'UPDATE ' + mysqlConf.database + dbTable + ' SET ' + req.body.valueToChange + '=' + db.escape(req.body.newValue) + ' where id = ' + db.escape(req.params.id);

  sqlQuery(sql);
});

router.delete('/userAccess/:id', (req, res, next) => {
  if (req.params.id === undefined) {
    return 1;
  }
  const sql = 'UPDATE ' + mysqlConf.database + dbTable + ' set deactivated = now() WHERE id = ' + db.escape(req.params.id);

  sqlQuery(sql);
});

router.post('/userAccess', (req, res, next) => {
  // Required fields
  if (req.body.name === undefined || req.body.URL === undefined || req.body.type === undefined || req.body.description === undefined) {
    return 1;
  }
  const sql = 'INSERT INTO ' + mysqlConf.database + dbTable + ' (name, description, URL, type, icon, sortorder) values (' + db.escape(req.body.name) + ', ' + db.escape(req.body.description) + ', ' + db.escape(req.body.URL) + ', ' + db.escape(req.body.type) + ', ' + db.escape(req.body.icon) + ', ' + db.escape(req.body.sortorder) + ')';

  sqlQuery(sql);
});

module.exports = router;
