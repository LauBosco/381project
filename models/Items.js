var mongoose = require('mongoose');

var itemSchema = mongoose.Schema({
    id:{type: String, required: true},
    name:{type: String, required: true},
    description:{type: String},
    category:{type: String, required: true},
    quantity:{type: Number, min:1, required: true}
});

module.exports = itemSchema;	
