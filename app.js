require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const morgan = require('morgan');
const winstonLoader = require('winston-sugar');
winstonLoader.config('./config/winston.json');
const log = winstonLoader.getLogger('app');
log.stream = {
  write: function (message, encoding) {
    log.info(message.trim());
  },
};

log.info('----------------------------------');
log.info('--');
log.info('-- Starting');
log.info('--');
log.info('----------------------------------');

console.log = (...args) => log.info(...args);
console.info = (...args) => log.info(...args);
console.warn = (...args) => log.warn(...args);
console.error = (...args) => log.error(...args);
console.debug = (...args) => log.debug(...args);

const session = require('express-session');
const FileStore = require('session-file-store')(session); // store session in files rather than memory to allow restore session after restart of program.

// const MemoryStore = require('memorystore')(session); // To avoid memory leaks

const fileUpload = require('express-fileupload');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

const userAdminRouter = require('./routes/userAdmin');
const userAccessRouter = require('./routes/userAccess');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('tiny', { stream: log.stream }));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());

// AGR start
const sessionObj = {
  // cookie: {maxAge: 60 * 60 * 12 * 1000 },
  cookie: { sameSite: 'strict' },
  secret: 'RQxvg8MYP8JGbwaLPEst9YC7LJe65SwrTftbKsF3XLkmpaA2P84RCG7pugmRzZfS',
  resave: true,
  saveUninitialized: false,
};

if (typeof MemoryStore !== 'undefined') {
  // prune expired entries every 12h
  sessionObj.store = new MemoryStore({ checkPeriod: 60 * 60 * 12 * 1000 });
} else if (typeof FileStore !== 'undefined') {
  sessionObj.store = new FileStore({ ttl: 60 * 60 * 12 * 1000 });
}

app.use(session(sessionObj));

app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.json());

app.use('/', authRouter);

// Make the session variable available to .ejs
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.access = req.session.access;
  next();
});
// AGR end
app.use(fileUpload());

app.use('/', indexRouter);
app.use('/userAdmin/', userAdminRouter);
app.use('/userAccess/', userAccessRouter);
app.use(express.static(path.join(__dirname, 'public')));
// AGR start
// app.use(express.static(path.join(__dirname, 'public', 'AdminLTE')));
// app.use(express.static(path.join(__dirname, 'node_modules', 'admin-lte')));
app.use(express.static(path.join('public', 'bower_components', 'admin-lte')));
// AGR end

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
