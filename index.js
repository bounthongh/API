// FileName: index.js

// Import express
var express = require('express')
var port = 80;
var app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var http = require('http');


var PHPUnserialize = require('php-unserialize');
const Serialize = require('php-serialize')
var bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connection to mysql

var mysql = require('mysql');

var connection = mysql.createConnection({
  host : '127.0.0.1',
  user : 'root',
  password : 'root',
  database : 'test'
});

var listener = app.listen(port, function() {
    console.log('Listening on port ' + listener.address().port); //Listening on port 8080
});

connection.connect(function(err) {
 if (err) throw err;
 console.log("Your're connected to mysql !");
});

connection.on('error', function(err) {
  console.log("[mysql error]",err);
});

//All routes

app.all('/*', function(req, res, next) {
 // CORS headers
 res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
 res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
 // Set custom headers for CORS
 res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
 if (req.method == 'OPTIONS') {
 res.status(200).end();
 } else {
 next();
 }
});

// Step1

app.get('/api/domains.json', function(req, res) {
var id = req.param('id');
if (id == undefined) {
   connection.query('SELECT id, name, description FROM domain', function(error,data) {
     res.send({
       code:200,
       message: "success",
       datas:data
     });
   });
 }
 else {
   res.send({
     code : 404,
     message: "Not found"
   });
 }
 // if (id == undefined ){
 //   var sql1 = 'SELECT id, name, description FROM domain';
 //   connection.query(sql1, function(err,data) {
 //     if (err) throw err;
 //     var user = data[0];
 //     if (user == undefined) {
 //       res.status(404);
 //       res.send({
 //         code: 404,
 //         message: "Not found"
 //       });
 //     }
 //     else {
 //       res.send({
 //         code:200,
 //         message:'success',
 //         datas:data
 //       });
 //     }
 //   });
 //  }
});

// Step2

app.get('/api/domains/:id.json', function(req, res) {

  const domain_id = req.params.id;

  var sql1 = 'SELECT domain.id, name, description, created_at, user.username, user.id FROM domain INNER JOIN user on domain.user_id = user.id INNER JOIN domain_to_lang on domain.id = domain_to_lang.domain_id WHERE domain.id = (?)';
  connection.query(sql1, domain_id, function(error, data) {
     var sql2 = 'SELECT lang_id as lang FROM domain_to_lang WHERE domain_id = (?)';
     var id = {};
     id = data;
     connection.query(sql2, domain_id, function(err, langue) {
       var lang = {};

       for (var i = 0; i < langue.length; i++) {
         lang[i+1] = langue[i].lang;
       }
       if (data[0]) {
         var Data = {};
         Data.id = data[0].id;
         Data.name = data[0].name;
         Data.description = data[0].description;
         Data.created_at = data[0].created_at;
         Data.creator = {};
         Data.creator.username = data[0].username;
         Data.creator.id = data[0].id;
         Data.lang = lang;

         if (req.params.id == data[0].id) {

           const secure_request = 'authorization' in req.headers;

           if (secure_request) {
             const token = req.headers.authorization;
             connection.query('SELECT id FROM user WHERE api_key = (?)', token, function(error,data) {

                 if (data.length == 0) {
                   res.status(401);
                   return res.json({code: "401", message: "Unauthorized"});
                 }

                 user_id = data [0].id;
                 connection.query('SELECT * FROM domain WHERE id = (?) AND user_id = (?)', [domain_id, user_id], function(error,data) {

                   if (data.length == 0) {
                     res.status(403);
                     return res.json({code: "403", message: "Forbidden"});
                   }

                   else {
                     res.send({
                       code:200,
                       message: "success",
                       datas: Data
                     });
                   }
                 });
             });

           }

           else {
             res.send({
               code:200,
               message: "success",
               datas: Data
             });
           }
        }
       }
       else {
         res.send({
           code:404,
           message: "Not found",
         });
       }
     });
   });
});

// Step3

app.get('/api/domains/:id/translations.json', function(req, res) {

  const domain_id = req.params.id

  const filter = req.query.key
  if (filter) {
    if (filter.length > 0) {
      var variables = [domain_id, filter]
      var sql = 'SELECT translation.id, translation.key, translation_to_lang.value, translation_to_lang.lang_id FROM domain, translation, translation_to_lang WHERE domain.id AND domain.id=(?) AND translation.key LIKE (?)';
    }
  }
  else {
    var variables = domain_id
    var sql = 'SELECT translation.id, translation.key, translation_to_lang.value, translation_to_lang.lang_id FROM domain, translation, translation_to_lang WHERE   domain.id AND domain.id=(?)';
  }
  connection.query(sql, variables, function(error, data) {
    if (error)
      throw error;
    let meta = [];
    for (item in data) {
      meta[item] = data[item];
    }
    var dt = [];
    var cpt = [];
    for (var i = 0; meta[i]; i++) {
      if (cpt.indexOf(meta[i].id) == -1) {
        var result = {};
        result.id = meta[i].id;
        result.key = meta[i].key;
        result.trans = {};
        result.trans.de = meta[i].value;
        if(meta[i+1]){
          result.trans.es = meta[i+1].value;
        }
        dt.push(result);
        cpt.push(meta[i].id);
      }
    }
    if (data[0]) {
    res.send({
      code: 200,
      message: "success",
      datas: dt
    });
  }
  else {
    res.send({
      code: 404,
      message: "Not found"
    });
  }
  // Object.keys(req.query).forEach(function(key){

  //   if (key != 'key') {
  //     res.send({
  //       code: 400,
  //       message: "Bad Request"
  //     });
  //   }
  // });
});
});

// Step 4

// app.post('/api/domains/:id/translations.json', function(req, res) {
//   connection.query('INSERT INTO translation SET ?', req.body, (error, result) => { 
//         if (error) throw error;
//         var sql = 'select * from translation where id = get_last_id()'
//         connection.query(sql, [req.params.id], function(error, data) {
//           var id = data;
//           data = result;
//           res.json({code: "201", message: "succes", datas: result, trans: "" }); //.send(`"data": ${result.insertId}`);

//         });
//         // res.json({code: "201", message: "succes", datas: result, trans: "" }); //.send(`"data": ${result.insertId}`);
//     });
//   // req.json(req.body);
// });


// app.post('/api/domains/:id/translations.json', jsonParser, function(req, res) {
//   var sql1 = "INSERT INTO translation ('id' ,'key', 'domain_id') VALUES (?, ?, ?)"; 
//   var sql2 = "INSERT INTO translation_to_lang ('lang_id', 'translation_id') VALUES (?, ?)"; 
//   var insert1 = [req.body.id, req.body.key, req.body.domain_id]; 
//   var insert2 = [req.body.lang_id, req.body.translation_id];
//    var list = req.body.id;
//   // const id = req.params.id;
//   connection.query(sql1, req.body.id, function(error, result, field){ 
//     // var list = req.body.id;
//       if(error) { 
//       res.write(JSON.stringify(error)); 
//       res.end(); 
//       } 
//       else { 
//         connection.query(sql2, req.body.id, function(error, results, fields) { 
//           if(error){ 
//             res.write(JSON.stringify(error)); 
//             res.end(); 
//           } 
//        }); 
//       } 
//     });

// });

app.post('/api/domains/:id/translations.json', function(req, res) {
  const key = req.body.key;
  const domain_id = req.params.id;

  const token = req.headers.authorization;
  connection.query('SELECT id FROM user WHERE api_key = (?)', token, function(error,data) {

      if (data.length == 0) {
        res.status(401);
        return res.json({code: "401", message: "Unauthorized"});
      }

      user_id = data [0].id;
      connection.query('SELECT * FROM domain WHERE id = (?) AND user_id = (?)', [domain_id, user_id], function(error,data) {

        if (data.length == 0) {
          res.status(403);
          return res.json({code: "403", message: "Forbidden"});
        }

        else {
          connection.query('INSERT INTO translation (key, domain_id) VALUES (?,?)', [key, domain_id], (error, result) => {
            if (error) throw error;
            const data = {"id": domain_id, "key": key, "trans":"toto"}
            res.status(201);
            res.json({code: "201", message: "success", datas: data});
          });
        }
      });
  });
});

// Step 5

app.put('/api/domains/:id/translation/:key.json', function (req, res) {
    const id = req.params.id;
    const key = req.body.key
    connection.query('UPDATE translation SET (?) WHERE translation.domain_id = (?)', [id, key], (error, result) => {

        if (error) throw error;
        const data = {"id":id, "key":key};
       res.json({code: "200", message: "success", datas: data});
    });
});

// Step 6

app.delete('/api/domains/:id/translation/:key.json', function (req, res) {
  const id = req.params.id;
  const key = req.params.key;
  connection.query('DELETE FROM translation WHERE translation.domain_id = (?) AND translation.key = (?)', [id, key],  (error, result) => {
        if (error) throw error;
        const datas = {"id":id}
        res.json({code: "200", message: "success", datas: datas});
    });
});

// Error 404

// For GET
app.get('*', function(req, res){
 res.status(404);
 res.send({
 code: 404,
 message: "Not found"
 });
});

// For POST
app.post('*', function(req, res){
 res.status(404);
 res.send({
 code: 404,
 message: "Not found"
 });
});

//For PUT
app.put('*', function(req, res){
 res.status(404);
 res.send({
 code: 404,
 message: "Not found"
 });
});

//FOR DELETE
app.delete('*', function(req, res){
 res.status(404);
 res.send({
 code: 404,
 message: "Not found"
 });
});
