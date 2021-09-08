require('dotenv').config();

var fs = require('fs');
var createError = require('http-errors');
const { ethers } = require("ethers");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { configureNetworks } = require('./indexer');
var https = require('https');

var indexRouter = require('./routes/index');

configureNetworks().then(() => {
  console.log("Configuring networks complete. Listening to current events and setting up web endpoint.");
})

var app = express();

// var privateKey  = fs.readFileSync('./server.key', 'utf8');
// var certificate = fs.readFileSync('./server.crt', 'utf8');
// var credentials = { key: privateKey, cert: certificate };

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/ping', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Bitgem multinetwork validator server listening at http://localhost:${process.env.SERVER_PORT}`)
})

// var httpsServer = https.createServer(credentials, app)
// httpsServer.listen(process.env.SERVER_HTTPS_PORT);

module.exports = app;
