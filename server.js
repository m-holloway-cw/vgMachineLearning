const express = require('express');
const mustacheExpress = require("mustache-express");
const bodyParser = require('body-parser');
const app = express();
const request = require('request');
var path = require('path');
var handlebars = require('handlebars');
var session = require('express-session');

let {PythonShell} = require('python-shell');

exports.app = app;


app.engine('html', mustacheExpress());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: '312adfa',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: true,
    sameSite: 'none'
  }
}));
app.set('view engine', 'ejs')
app.set('views', './views');






//capstone stuff

var username = 'admin';
var password = '1234';

function checkLogin(req){
  if(req.session && req.session.username === username && req.session.password === password){
    return true;
  } else {
    return false;
  }
}

app.get('/vgsales', function(req, res){
  if(checkLogin(req)){
    res.render('vgsales', {user: req.session.username});
  } else {
    res.redirect('vgLogin');
  }
});

/* uncomment for testing without login
app.get('/vgsales', function(req, res){
    res.render('vgsales', {user: 'holdername'});
});*/


app.get('/vgLogin', function(req, res){
  res.render('vgLogin');
});

app.post('/vgLogin', function(req, res){
  if(req.body.username === username && req.body.password === password){
    req.session.username = username;
    req.session.password = password;
    res.redirect('vgsales')
  } else {
    res.send('vgLogin')
  }
});

//run python program to generate data for vis
app.get('/getSales', function(req, res){
  runPyApp(res);
});

function runPyApp(res){
  var opts = {
    args: []
  };
  PythonShell.run('./python/vgsales.py', opts, function(err, data){
    if(err) res.send(err);
    if(data[1] === 'DONE'){
      res.send(data[0])
    }
  })
}

app.get('/vgJS', function(req, res){
  res.sendFile(__dirname + '/public/js/vgsales.js');
})

app.get('/test', function(req, res){
    runPredictor(req, res);
});


app.post('/predictor', function(req, res){
    runPredictor(req, res);
});

function runPredictor(req, res){

  var json = JSON.stringify(req.body);
  var opts = {
    args: [json]
  };
  PythonShell.run('./python/predictor.py', opts, function(err, data){
    if(err) res.send(err);
    if(data != null){
      if(data.pop() === 'DONE'){
        res.send(data.pop()) //send last element in data array after removing done
        //this should be the desired results from prediction only
      }
    }
  })
}

app.post('/getData', function(req, res){
    runDataBuilder(req, res);
});

function runDataBuilder(req, res){
  var limit = req.body.queryLimit;
  var opts = {
    args: [limit] //python only needs the count
  };
  PythonShell.run('./python/dataBuilder.py', opts, function(err, data){
    if(err) res.send(err);
    if(data != null){
      if(data.pop() === 'DONE'){
        res.send(data.pop()) //send last element in data array after removing done
        //this should be the desired results from query limited array only
      }
    }
  })
}


app.listen(8080, function () {

});
