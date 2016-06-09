// Load required packages
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Dwords');

// Define our beer schema
var DataSchema   = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  date: {type: Date,'default': Date.now},
   date_created:Date,
});

// Export the Mongoose model
module.exports = mongoose.model('Data', DataSchema);