var express = require('express');
var csv = require('express-csv');
var json2csv = require('json2csv');
var fs = require('fs');
var Converter = require("csvtojson").Converter;
var nodeExcel = require('excel-export');
var dateFormat = require('dateformat');
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');

var Data = require('./models/data');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.get('/create', function(req, res) {
    res.render('create', {
        title: 'Add New Users'
    });
});

app.get('/dashboard', function(req, res) {
    res.render('dashboard', {
        title: 'Dashboard'
    });
});



app.post('/create', function(req, res) {
    var title = req.body.title;
    var category = req.body.category;
    var description = req.body.description;
    var date_created = req.body.date_created;
    var date = new Date();

    var data = new Data();
    data.title = title;
    data.category = category;
    data.description = description;
    data.date_created = date_created;
    data.date = date;

    data.save(function(err, user) {

        if (err) {
            console.log(err);
            return res.status(500).send();
        } else {
            // res.json({user: user });
            console.log('user saved' + user);
            res.send('user created');
            return res.status(200).send();
        }

    });
});

app.get('/', function(req, res) {
    Data.find({}, function(err, users) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        } else {

            console.log(users);
            res.json({
                users: users
            });

        }
    }).sort({
        date_created: 1
    });
});

var fields = ['title', 'category', 'date', 'date_created', 'description'];
// var myCars = [
//   {
//     "car": "Audi",
//     "price": 40000,
//     "color": "blue"
//   }, {
//     "car": "BMW",
//     "price": 35000,
//     "color": "black"
//   }, {
//     "car": "Porsche",
//     "price": 60000,
//     "color": "green"
//   }
// ];
Data.find({}, function(err, users) {
            if (err) {
                console.log(err);
                return res.status(500).send();
            } else {
                console.log(users.length+'--------------------------------');
                json2csv({
                    data: users,
                    fields: fields
                }, function(err, csv) {
                    if (err) console.log(err);
                    fs.writeFile('file.csv', csv, function(err) {
                        if (err) throw err;
                        console.log('file saved');
                    });
                });

                var converter = new Converter({});
                converter.fromFile("./file.csv", function(err, result) {
                        if (err) console.log(err);
                        //console.log(result);
                        var numberOfSavedRecords = 0;
                        var numberOfErrorRecords = 0;
                        console.log(result.length);
                        result.forEach(function(item){
                            //console.log(item);
                            var current = item;
                            var data = new Data();
                            data.title = current.title;
                            data.category = current.category;
                            data.description = current.description;
                            data.date_created = new Date(current.date_created);
                            data.date = new Date();

                            data.save(function(err, user) {
                                if (err) {
                                    console.log(err);
                                    numberOfErrorRecords++;
                                } else {
                                    numberOfSavedRecords++;  
                                }
                            });
                        })
                        console.log('Report: '+numberOfSavedRecords + 'records completed and ' + numberOfErrorRecords + ' records failed');
                    
                });

            }

});
app.listen(3000, function() {
    console.log('listening on *:3000');
});
module.exports = app;
