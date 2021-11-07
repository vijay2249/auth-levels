require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose')
// const encrypt = require('mongoose-encryption');
// const md5 = require("md5")
const bcrypt = require("bcrypt")
const saltRounds = 13

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/auth");

// User Schema creation
const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

// const key = process.env.KEY
// userSchema.plugin(encrypt, {secret: key, encryptedFields: ['password']})

// User Model creation
const User = new mongoose.model("auth", userSchema)

// Root route get method
app.get("/", (request, response)=>{
  response.render("home")
})

// All methods for register route
app.route("/register")
  .get((request, response)=>{
    response.render("register")
  })
  .post((request, response)=>{
    bcrypt.hash(request.body.password, saltRounds, function(err, hash){
      const newUser = new User({
        email: request.body.username,
        password: hash
      })
      newUser.save(function(err){
        if(err)console.log(err);
        else response.render("secrets")
      })
    })
  });

// Handling methods for login route
app.route("/login")
  .get((request, response)=>{
    response.render("login")
  })
  .post((request, response)=>{
    const {username, password} = request.body
    User.findOne({email: username}, function(err, result){
      if(err)console.log(err);
      else{
        bcrypt.compare(password, result.password, function(err, result){
          if(result){
            response.render("secrets")
          }else{
            console.log("passwords didnt match");
          }
        })
      }
    })
  })


app.listen(process.env.PORT || 3000, function() {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});
