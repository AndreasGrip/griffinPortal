const express = require('express');
const mysqlConf = require('../agr_conf/mysql_config');
const Mysql = require('../agr_lib/mysql_lib');

const router = express.Router();
const db = new Mysql(mysqlConf);

const dbTable = '.useraccess';

function sqlQuery(sql,res) {
  db.query(sql)
    .then(data => {
      const result = data[0];
      res.status(200).json(result);
    })
    .catch(err => {
      res.status(400).json(err).end();
    });

}

router.get('/', (req, res, next) => {
  res.render('userAccess', {label: 'userAccess', path: 'userAccess/'});
});

router.get('/list', (req, res, next) => {
  const sql = 'select id, name, description, URL, type, icon, sortorder FROM ' + mysqlConf.database + dbTable + ' where deactivated is null';
  sqlQuery(sql,res);
});

router.patch('/:id', (req, res, next) => {
  if (req.params.id === undefined || req.body.valueToChange === undefined || req.body.newValue === undefined) {
    return false;
  }
  // what value should be possible to change.
  switch (req.body.valueToChange) {
    case 'name':
    case 'description':
    case 'URL':
    case 'type':
    case 'icon':
    case 'sortorder':
      break;
    default:
      return false;
  }

  const sql = 'UPDATE ' + mysqlConf.database + dbTable + ' SET ' + req.body.valueToChange + '=' + db.escape(req.body.newValue) + ' where id = ' + db.escape(req.params.id);

  sqlQuery(sql,res);
});

router.delete('/:id', (req, res, next) => {
  if (req.params.id === undefined) {
    return false;
  }
  const sql = 'UPDATE ' + mysqlConf.database + dbTable + ' set deactivated = now() WHERE id = ' + db.escape(req.params.id);

  sqlQuery(sql,res);
});

router.post('/', (req, res, next) => {
  // Required fields
  if (req.body.name === undefined || req.body.URL === undefined || req.body.type === undefined || req.body.description === undefined) {
    return 1;
  }
  const sql = 'INSERT INTO ' + mysqlConf.database + dbTable + ' (name, description, URL, type, icon, sortorder) values (' + db.escape(req.body.name) + ', ' + db.escape(req.body.description) + ', ' + db.escape(req.body.URL) + ', ' + db.escape(req.body.type) + ', ' + db.escape(req.body.icon) + ', ' + db.escape(req.body.sortorder) + ')';

  sqlQuery(sql,res);
});

module.exports = router;
