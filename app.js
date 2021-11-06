require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose')

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoDB connection using env and dotenv module
try{
  mongoose.connect(`mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@${process.env.CLUSTER_CODE}.mongodb.net/${process.env.DATABASE_NAME}`)
  console.log("Connection to mongoDB success");
}catch(err){
  console.log("Connection to mongoDB database Failed");
  console.log(err);
}

app.listen(process.env.PORT || 3000, function() {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});
