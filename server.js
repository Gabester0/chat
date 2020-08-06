"use strict";

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const auth = require("./app/auth.js");
const routes = require("./app/routes.js");
const mongo = require("mongodb").MongoClient;
const passport = require("passport");
const cookieParser = require("cookie-parser");
const app = express();
const http = require("http").Server(app);
const sessionStore = new session.MemoryStore();
const io = require("socket.io")(http);
const cors = require("cors");
const passportSocketIo = require("passport.socketio");
require('dotenv').config();
app.use(cors());

fccTesting(app); //For FCC testing purposes

app.use("/public", express.static(process.cwd() + "/public"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "pug");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    key: "express.sid",
    store: sessionStore
  })
);

mongo.connect(process.env.DATABASE, (err, client) => {
  let db = client.db("FreeCodeCampSocial");

  if (err) {
    console.log("Database error: " + err);
  } else {
    auth(app, db);
    routes(app, db);

    http.listen(process.env.PORT || 3000);

    //start socket.io code

    io.use(passportSocketIo.authorize({
      cookieParser:   cookieParser,
      key:            'express.sid',
      secret:         process.env.SESSION_SECRET,
      store:          sessionStore
    }, (success, fail)=>{
      if(success){
        console.log("%c authorize with socket successful!", "color: #00ee00; background-color: black;");
      } else {
        console.log("%c authorize with socket failed.", "color: red; background-color: black;");
      }
    }));
    
    let currentUsers = 0;
    io.on('connection', socket => {
      ++currentUsers;
      console.log("user " + socket.request.user.name + " connected");
      io.emit("user", { name: socket.request.user.name, currentUsers, connected: true});
      
      socket.on('chat message', message=>{
        io.emit('chat message', {name: socket.request.user.name, message})
      })
      
      socket.on('disconnect', () => {
        --currentUsers;
        io.emit("user", {name: socket.request.user.name, currentUsers, connected: false});
      });
    });
    

    //end socket.io code
  }
});
