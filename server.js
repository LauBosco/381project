const assert = require('assert');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const mongoose = require('mongoose');
const itemSchema = require('./models/Items');

const mongourl = 'mongodb+srv://dev:dev@cluster0.q8fti4a.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp'; 
const dbName = '381project';
const dbCol = 'Items'

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('cookie-session');
const SECRETKEY = 'akey';

var userAccount = new Array(
    {name: "user1", password: "password1"},
    {name: "user2", password: "password2"},
    {name: "user3", password: "password3"}
);

app.set('view engine', 'ejs');
app.use(session({
    userid: "session",
    keys: [SECRETKEY],
}));
app.use(express.json());
app.use(express.urlencoded());

//CRUD
const handle_Find = function(res, criteria, callback){
    mongoose.connect(mongourl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', async () => {
    	let Items = mongoose.model('Items', itemSchema);
    	try{
        	const searchResult = await Items.find(criteria).lean().exec();
        	//console.log(searchResult);
    		return callback(searchResult);
        }catch(err){
        	console.error(err);
        	console.log("Error occurred");
        }finally{
        	db.close();
        	console.log("Closed DB connection");
        }
    });
}

//Routing
app.get('/', function(req, res){
    if(!req.session.authenticated){
        console.log("user not authenticated; directing to login");
        res.redirect("/login");
    }else{
        res.redirect("/login");
    }
    console.log("Welcome back " + req.session.userid);
});

app.get('/login', function(req, res){
    console.log("...Welcome to login page.")
    res.sendFile(__dirname + '/public/login.html');
    return res.status(200).render("login");
});

app.post('/login', function(req, res){
    console.log("client:", req.body.username, req.body.password)
    for (const account in userAccount){
        console.log("...Handling your login request");
        console.log("server:", userAccount[account]["name"], userAccount[account]["password"])
        if (userAccount[account]["name"] == req.body.username && userAccount[account]["password"] == req.body.password) {
        req.session.authenticated = true;
        req.session.userid = userAccount[account]["name"];
        console.log(req.session.userid);
        return res.status(200).redirect("/home");
        }
    }
    console.log("Error username or password.");
    return res.redirect("/");
});

app.get('/logout', function(req, res){
    req.session.authenticated = false;
    res.redirect('/login');
});

app.get('/home', function(req, res){
    console.log("...Welcome to the home page!");
    handle_Find(res,{}, function(foundItems){
        var amount = foundItems.length;
        var quantity = 0;
        for (var item in foundItems){
        	quantity+=foundItems[item]["quantity"];
        }
        return res.status(200).render("home", {quantity: quantity, amount: amount, foundItems: foundItems});
    });
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
    return res.status(200).redirect("/home");
});

app.get('/update', function(req,res) {
    console.log("...Welcome to the update page!");
    return res.status(200).render("update");
})

app.post('/update', function(req, res){
    console.log("...Item updated successfully!")
    return res.status(200).redirect("/home");
});

app.get('/delete', function(req, res){
    console.log("...Item deleted successfully!")
    return res.status(200).redirect("/home");
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
        handle_Find(res, criteria, function(foundItems){
            client.close();
            console.log("Database disconnected");
            return res.status(200).json(foundItems);
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
