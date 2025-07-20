// server.js
// where your node app starts

// init project
var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));


// init sqlite db
var fs = require('fs');
var dbFile = './variants.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);


app.get('/search', function(req, res) {  
  if (!req.query.searchval){
    req.query.searchval = 'DO A BLANK SEARCH';
  }
  
  var sql = 'SELECT * from variants where lcsh_pref like ? or wiki_pref like ?';

  sql = sql + ' LIMIT 100';
  
  db.all(sql, '%'+req.query.searchval+'%', function(err, rows) {
    console.log(sql);
    if (err){console.log(err);}
    var results = [];      
    rows.forEach((r)=>{
      // r.subject = r.subject.split('|');
      r.lcsh_alts = r.lcsh_alts.split('|').sort()
      r.wiki_alts = r.wiki_alts.split('|').sort()
      r.data_alts = r.data_alts.split('|').sort()

      
      results.push(r);
    });

    res.send(JSON.stringify(results));    
    
  });
  
  
});


app.get('/all/', function(req, res) {  
  if (!req.query.page){
    req.query.page = 0;
  }
  var offset = parseInt(req.query.page) * 5000
  var sql = 'SELECT lcsh_pref, wiki_pref from variants order by lcsh_pref ASC LIMIT 5000 OFFSET ' + offset;

  
  db.all(sql, function(err, rows) {
    if (err){console.log(err);}   
    res.send(JSON.stringify(rows));    
  });
  
  
});


// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(req, res) {
  db.all('SELECT lcsh_pref FROM variants ORDER BY RANDOM() LIMIT 100;', function(err, rows) {
      
      

      res.render('index', { randos:   JSON.stringify(rows.map((r)=>{return r.lcsh_pref}))   });
    
    
  });  
});





// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
