require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const userAdminRouter = require('./routes/userAdmin');
const userAccessRouter = require('./routes/userAccess');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(cookieParser());

// AGR start
app.use(
  session({
    secret: 'skokanonsomsatan',
    resave: true,
    saveUninitialized: false
  })
);
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

app.use('/', authRouter);

// Make the session variable available to .ejs
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.access = req.session.access;
  next();
});
// AGR end

app.use('/', indexRouter);
app.use('/userAdmin/', userAdminRouter);
app.use('/userAccess/', userAccessRouter);
app.use(express.static(path.join(__dirname, 'public')));
// AGR start
app.use(express.static(path.join(__dirname, 'public', 'AdminLTE')));
app.use(express.static(path.join(__dirname, 'node_modules', 'admin-lte')));
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
