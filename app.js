//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session"); //cookies:1
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({ //cookies:2
  secret: "My Little Secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize()); //cookies:3
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose); //cookies:4

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy()); //for local login strategy //cookies:5
passport.serializeUser(User.serializeUser()); //for creating a cookie with user details
passport.deserializeUser(User.deserializeUser()); //for destroying a cookie to fetch user details

app.get("/", function(req,res){
  res.render("home");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.get("/register", function(req,res){
  res.render("register");
});

app.get("/secrets", function(req, res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res, function(){
        res.redirect("/secrets");
      });
    }
  }); //passport-local-mongoose to act as middleman to create a new user and save it in mongoDB
});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err)
    {
      console.log(err);
    }else{
      passport.authenticate("local")(req,res, function(){
        res.redirect("/secrets");
      });
    }
  }); //this comes from the passport function

});


app.listen(3000, function(){
  console.log("Server started on port 3000");
});
