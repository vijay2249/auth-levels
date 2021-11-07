require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose')
// const encrypt = require('mongoose-encryption');
// const md5 = require("md5")
// const bcrypt = require("bcrypt")
// const saltRounds = 13
const session = require("express-session")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const passportLocalMongoose = require("passport-local-mongoose")

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: process.env.KEY,
  resave: false,
  saveUninitialized: false,
  maxAge: Date.now() + (86400 * 1000)
}))
app.use(passport.initialize())
app.use(passport.session())

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/auth");

// User Schema creation
const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

// const key = process.env.KEY
// userSchema.plugin(encrypt, {secret: key, encryptedFields: ['password']})
userSchema.plugin(passportLocalMongoose)

// User Model creation
const User = new mongoose.model("auth", userSchema)

/////////////////// THESE THREE LINES ARE TO TAKE CARE OF CREATION OF THE SESSIONS //////////////////
// use static authenticate method of model in LocalStrategy
// /////// THESE BELOW TWO LINES MEAN THE SAME THING  //////////
passport.use(new LocalStrategy(User.authenticate()));
// passport.use(User.createStrategy())

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Root route get method
app.get("/", (request, response)=>{
  response.render("home")
})

app.get("/secrets", (request, response)=>{
  if(request.isAuthenticated()) response.render("secrets")
  else response.redirect("/login")
})

// All methods for register route
app.route("/register")
  .get((request, response)=>{
    response.render("register")
  })
  .post((request, response)=>{
    User.register({username: request.body.username}, request.body.password, function(err, result){
      if(err){
        console.log(err);
        response.redirect("/register")
      }else{
        passport.authenticate("local")(request, response, function(){
          response.redirect("/secrets")
        })
      }
    })
  })
  /////////////////  HANDLING POST REQUEST AND USAGE OF BCRYPT  /////////////////////////////
  // .post((request, response)=>{
  //   bcrypt.hash(request.body.password, saltRounds, function(err, hash){
  //     const newUser = new User({
  //       email: request.body.username,
  //       password: hash
  //     })
  //     newUser.save(function(err){
  //       if(err)console.log(err);
  //       else response.render("secrets")
  //     })
  //   })
  // })

// Handling methods for login route
app.route("/login")
  .get((request, response)=>{
    response.render("login")
  })
  .post((request, response)=>{
    const newUser = new User({
      username: request.body.username,
      password: request.body.password
    })
    request.login(newUser, function(err){
      if(err)console.log(err);
      else{
        passport.authenticate("local")(request, response, function(){
          response.redirect("/secrets")
        })
      }
    })
  })
  /////////////////  HANDLING POST REQUEST AND USAGE OF BCRYPT  /////////////////////////////
  // .post((request, response)=>{
  //   const {username, password} = request.body
  //   User.findOne({email: username}, function(err, result){
  //     if(err)console.log(err);
  //     else{
  //       bcrypt.compare(password, result.password, function(err, result){
  //         if(result){
  //           response.render("secrets")
  //         }else{
  //           console.log("passwords didnt match");
  //         }
  //       })
  //     }
  //   })
  // })

app.get("/logout", (request, response)=>{
  request.logout()
  response.redirect("/")
})


app.listen(process.env.PORT || 3000, function() {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});
