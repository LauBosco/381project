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
let currentItem = '';
let returnMsg='';
let nextID='';

app.set('view engine', 'ejs');
app.use(session({
    userid: "session",
    keys: [SECRETKEY],
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true}));

/*Read Item function*/
const findItem = function(res, criteria, callback){
    mongoose.connect(mongourl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', async () => {
        let Items = mongoose.model('Items', itemSchema);
        try{
            const searchResult = await Items.find(criteria).sort('id').lean().exec();
            return callback(searchResult);
        }catch(err){
            console.error(err);
            console.log("Error occurred");
        }finally{
            db.close();
            console.log("Closed DB read connection");
        }
    });
}

/*Update Item function*/
const updateItem = function(criteria, updateQuantity, callback){
    mongoose.connect(mongourl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
	db.once('open', async () => {
		let Items = mongoose.model('Items', itemSchema);
		try{
			const updateValue={'quantity':updateQuantity};
			const updateResult = await Items.updateOne(criteria,updateValue).exec();
			return callback(updateResult.acknowledged);
		}catch(err){
			console.error(err);
			console.log("Error occurred");
		}finally{
			db.close();
			console.log("Closed DB update connection")
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
    var msg = returnMsg;
    returnMsg='';
    findItem(res,{}, function(allItems){
        var amount = allItems.length;
	nextID = "";
        nextID+=(amount+1);
        var quantity = 0;
        for (var item in allItems){
            quantity+=allItems[item]["quantity"];
        }
        return res.status(200).render("home", {msg:msg,quantity: quantity, amount: amount, foundItems: allItems});
    });
});

app.get('/search', function(req, res){
    console.log("...Welcome to the search page!");
	return res.status(200).render("search",{msg:''});
});

app.post('/detail', function(req, res){
    const criteria = {};
    if (req.body.itemID){
    	criteria['id'] = req.body.itemID;}
    if (req.body.itemName){
    	criteria['name'] = req.body.itemName;}
    if (req.body.category){
    	criteria['category']=req.body.category;}
    if (req.body.quantity){
    	var comparison = {};
    	comparison[req.body.compare]=req.body.quantity;
    	criteria['quantity']=comparison;}
    if (criteria=={}){
    	return res.status(200).render('search', {msg:'Nothing is entered!'});}
    findItem(res,criteria, function(foundItems){
    	if (foundItems.length>=1){
    		currentItem=foundItems;
    		return res.status(200).render('detail', {msg:`Found ${foundItems.length} matching item:  `,foundItems: foundItems});
    	}else{
    		return res.status(200).render('search', {msg:'Could not find anything by inputted id or name, sorry!'});}
   	});
});

app.get('/create', function(req, res){
    console.log("...Welcome to the create page!");
    var ID=nextID.padStart(4,'0');
    return res.status(200).render("create",{message:"Item info with * is mandatory!",nextID:ID});
});

app.post('/create', function(req, res){
    mongoose.connect(mongourl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', async () => {
    	const Item = mongoose.model('Items',itemSchema);
    	try{
       	    let items={};
            items["id"] = req.body.itemID;	
            items['name']= req.body.name;
            items['description']= req.body.desc;
            items['category']= req.body.category;
            items['quantity']= req.body.quantity;
            if(req.body.pic){
                items['pic']= req.body.pic;
            }
            const newItem = new Item(items);
            const createItem = await newItem.save();
            console.log(createItem);
            console.log('Item created!');
            returnMsg="Item is created successfully!";
            return res.status(200).redirect("/home");
        }catch (err){
            console.error(err);
            return res.status(200).render("create", {message:"Item create failed!"});
        } finally{
            db.close();
        }    
    });
});

app.post('/updateDetail', function(req,res) {
    console.log("...Welcome to the update page!");
    let criteria={};
    criteria['id']=req.body.updateID;
    findItem(res,criteria, function(oneItem){
    	currentItem = oneItem;
    	return res.status(200).render('update', {msg:'',foundItems: oneItem});
	});
});

app.post('/update', function(req, res){
	mongoose.connect(mongourl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
	db.once('open', async () => {
		let Items = mongoose.model('Items', itemSchema);
		try{
			let originalItem={};
			originalItem['id']=currentItem[0].id;
			const updateValue={'quantity':Number(req.body.quantity)};
			const updateResult = await Items.findOneAndUpdate(originalItem,updateValue,{new: true});
			console.log(updateResult);
			return res.status(200).render("detail", {msg:`Updated item quantity to ${req.body.quantity}`,foundItems:[updateResult]});
			console.log("update success")
		}catch(err){
			console.error(err);
			console.log("Error occurred");
		}finally{
			db.close();
			console.log("Closed DB update connection")
		}
	});
});

app.post('/delete', function(req, res){
    mongoose.connect(mongourl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
	db.once('open', async () => {
		try{
			let Items = mongoose.model('Items', itemSchema);
    		let criteria={};
    		criteria['id'] = req.body.updateID;
    		const deleteResult = await Items.findOneAndDelete(criteria);
    		console.log(deleteResult);
    		returnMsg=`Item ${req.body.updateID} is successfully deleted.`;
    		return res.status(200).redirect("/home");
    	}catch(err){
    		console.error(err);
    		console.log("Error occurred");
    	}finally{
    		db.close();
    		console.log("Closed DB delete connection")
    	}
	});
});

//Restful
//login
app.get("/api/item/login/:username/:password", function(req,res) {
    if (!req.params.username || !req.params.password) {
        return res.status(500).json({"error":"missing username or password"})
    }
    for (const account in userAccount){
        if (userAccount[account]["name"] == req.params.username && userAccount[account]["password"] == req.params.password) {
            req.session.authenticated = true;
            req.session.userid = userAccount[account]["name"];
            console.log(req.session.userid);
            return res.status(200).json({"message":"logged in successfully"})
        }
    }
    return res.status(500).json({"error":"wrong username or password"})
})

//logout
app.get("/api/item/logout", function(req,res) {
    req.session.authenticated = false;
    return res.status(200).json({"message":"logged out successfully"})
})

//insert
app.post("/api/item/insert", function(req,res) {
    if(!req.session.authenticated){
        return res.status(500).json({"error":"login required"})
    }
    mongoose.connect(mongourl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', async () => {
    	const Item = mongoose.model('Items',itemSchema);
    	try{
            const newItem = new Item(req.body);
            const createItem = await newItem.save();
            console.log(createItem);
            console.log('Item created!');
            return res.status(200).json({"message": "item created successfully"});
        }catch (err){
            console.error(err);
            return res.status(500).json({"error": "missing information"});
        } finally{
            db.close();
        }    
    });
})

//find
app.get("/api/item/find/:itemID", function(req,res) {
    if(!req.session.authenticated){
        return res.status(500).json({"error":"login required"})
    }
    if (req.params.itemID) {
        let criteria = {};
        criteria["id"] = req.params.itemID;
        findItem(res, criteria, function(foundItems){
            return res.status(200).json(foundItems);
        });
    } else {
        res.status(500).json({"error": "missing item ID"});
    }
})

//list
app.get("/api/item/list", function(req, res) {
    if(!req.session.authenticated){
        return res.status(500).json({"error":"login required"})
    }
    let criteria = {};
    findItem(res, criteria, function(foundItems){
        return res.status(200).json(foundItems);
    });
})

//update
app.put('/api/item/update/:itemID/:quantity', function(req, res){
    if(!req.session.authenticated){
        return res.status(500).json({"error":"login required"})
    }
    if ( !req.params.itemID || !req.params.quantity) {
	    return res.status(500).json({"error": "missing information"});
    }
    mongoose.connect(mongourl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
        db.once('open', async () => {
		let Items = mongoose.model('Items', itemSchema);
		try{
			let originalItem={};
			originalItem['id']=req.params.itemID;
			const updateValue={'quantity':Number(req.params.quantity)};
			const updateResult = await Items.findOneAndUpdate(originalItem,updateValue,{new: true});
			console.log(updateResult);
			return res.status(200).json({"message":"item updated successfully"});
			console.log("update success")
		}catch(err){
			console.error(err);
			console.log("Error occurred");
		}finally{
			db.close();
			console.log("Closed DB update connection")
		}
	});
});

//delete
app.delete("/api/item/delete/:itemID", function(req,res){
    if(!req.session.authenticated){
        return res.status(500).json({"error":"login required"})
    }
    if ( !req.params.itemID ) {
	    return res.status(500).json({"error": "missing itemID"});
    }
    mongoose.connect(mongourl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
	db.once('open', async () => {
	    try{
		let Items = mongoose.model('Items', itemSchema);
    		let criteria={};
    		criteria['id'] = req.params.itemID;
    		const deleteResult = await Items.findOneAndDelete(criteria);
    		console.log(deleteResult);
            return res.status(200).json({"message":"item deleted successfully"});
    	}catch(err){
    		console.error(err);
    		console.log("Error occurred");
    	}finally{
    		db.close();
    		console.log("Closed DB delete connection")
    	}
	});
})

app.listen(process.env.PORT || 8099);
