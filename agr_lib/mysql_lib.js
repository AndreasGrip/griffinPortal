const mysql = require('mysql2/promise');

class mysqlobj {
  constructor(mysqlSettings) {
    this.mysqlSettings = mysqlSettings;
    this.mysqlPool = mysql.createPool(this.mysqlSettings);
  }

  query(sqlQuery) {
    this.sqlQuery = sqlQuery;

    return this.mysqlPool.query(sqlQuery);
  }

  escape(variable) {
    return this.mysqlPool.escape(variable);
  }

  end() {
    return this.mysqlPool.end();
  }
}

module.exports = mysqlobj;
