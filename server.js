const assert = require('assert');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const mongourl = ''; 
const dbName = 'test';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('cookie-session');
const SECRETKEY = 'cs381'; //?

app.set('view engine', 'ejs');

//Routing
app.get('/', function(req, res){
    res.redirect("/login");
});

//login
app.get('/login', function(req, res){
    console.log("...Welcome to login page.")
    res.sendFile(__dirname + '/public/login.html');
    return res.status(200).render("login");
});

app.post('/login', function(req, res){
    console.log("...Handling your login request");
    return res.status(200).redirect("/home");
});

app.get('/logout', function(req, res){
    res.redirect('/login');
});

app.get('/home', function(req, res){
    console.log("...Welcome to the home page!");
    return res.status(200).render("home", {item_num: 999, test1: "itemname", test2: "itemID"});
});

app.get('/search', function(req, res){
    console.log("...Welcome to the search page!");
    return res.status(200).render("search");
});

app.post('/detail', function(req, res){
    res.status(200).render('display', {test_var: "success"});
});

app.get('/create', function(req, res){
    console.log("...Welcome to the create page!");
    return res.status(200).render("create");
});

app.post('/create', function(req, res){
    console.log("...Item created successfully!")
    return res.status(200).render("home");
});

app.get('/update', function(req,res) {
    console.log("...Welcome to the update page!");
    return res.status(200).render("update");
})

app.post('/update', function(req, res){
    console.log("...Item updated successfully!")
    return res.status(200).render("home");
});

app.get('/delete', function(req, res){
    console.log("...Item deleted successfully!")
    return res.status(200).render("home");
});



//Restful
//insert
app.post("/api/item/itemID/:itemID", function(req,res) {
    if (req.params.itemID) {
        console.log(req.body)
        const client = new MongoClient(mongourl);
        client.connect(function(err){
            assert.equal(null,err);
            console.log("Server connected successfully");
            const db = client.db(dbName);
            let newDocument = {};
            newDocument["itemID"] = req.body.itemID;

   	db.collection("items").insertOne(newDocument, function(err,results){
                assert.equal(err,null);
                client.close()
                res.status(200).end()
                    });
          
                })
            }
        else {
        res.status(500).json({"error": "missing item ID"});
    }
})

//find
app.get("/api/item/itemID/:itemID", function(req,res) {
    if (req.params.itemID) {
        let criteria = {};
        criteria["itemID"] = req.params.itemID;
        const client = new MongoClient(mongourl);
        client.connect(function(err) {
            assert.equal(null, err);
            console.log("Server connected successfully");
            const db = client.db(dbName);

            findDocument(db, criteria, function(docs){
                client.close();
                console.log("Closed database connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({"error": "missing item ID"});
    }
})

//delete
app.delete("/api/item/itemID/:itemID", function(req,res){
    if (req.params.itemID) {
        let criteria = {};
        criteria["itemID"] = req.params.itemID;
        const client = new MongoClient(mongourl);
        client.connect(function(err){
            assert.equal(null, err);
            console.log("Server connected successfully");
            const db = client.db(dbName);

            db.collection("items").deleteMany(criteria, function(err,results) {
                assert.equal(err,null)
                client.close()
                res.status(200).end();
            })
        });
    } else {
        res.status(500).json({"error": "missing item ID"});       
    }
})

app.listen(process.env.PORT || 8099);
