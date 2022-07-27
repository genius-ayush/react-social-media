const dotenv = require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('./models/user');
const userRoutes = require('./Routes/Users');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const path = require('path');
const engine = require('ejs-mate')
const MongoStore = require('connect-mongo')
const LocalStrategy = require('passport-local').Strategy
const crypto = require('crypto')
const postRoutes = require('./Routes/Posts')

const { createProxyMiddleware } = require('http-proxy-middleware');//easiest way to proxy in development mode, instead of editing package.json


const app = express();


//port 8080 is used for using cloud9 app preview
app.listen(process.env.PORT || 3001, ()=>{
    console.log('listening');
});


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, 
          {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
        console.log('connected');
        console.log(mongoose.connection.readyState)
    } catch (err) {
        console.log('Failed to connect to MongoDB', err);
    }
};

connectDB();


//set up storing session on server
const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collection: 'sessions'
})

// Configure Sessions Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  //store session on mongodb instead of locally
  store: sessionStore,
  cookie: { maxAge:  1000 * 60 * 60 } // 1 hour
}));

//passport middleware
//initialize passport for use
//allows user to be tracked with sessions (stay logged in)
//must be initialized before routes so it can be used in router
app.use(passport.initialize());
app.use(passport.session());

//to use with session. This is the serialize and deserialize user method from passport-local-mongoose
passport.serializeUser(function (user, cb) {
    cb(null, user.id);
  });
  passport.deserializeUser(function (id, cb) {
    User.findById(id, function (err, user) {
      if (err) {
        return cb(err);
      }
      cb(null, user);
    });
  });



//setup view engine (middleware)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine); //sets default ejs engine to ejs-mate





//function for verifying req.body pass with the hash
function validPassword(password, hash, salt) {
    var hashVerify = crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha512")
      .toString("hex");
    return hash === hashVerify;
  }

//passport localstrategy, verifying users using username and password
passport.use(
    new LocalStrategy(function (username, password, cb) {
      User.findOne({ username: username })
        .then((user) => {
          if (!user) {
            return cb(null, false);
          }
          const isValid = validPassword(password, user.hash, user.salt);
          if (isValid) {
            return cb(null, user);
          } else {
            return cb(null, false);
          }
        })
        .catch((err) => {
          cb(err);
        });
    })
  );
  

  //fix content security policy errors for images in deployment mode
  app.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        "img-src": ["'self'", "http: data:"]
      }
    })
  )

app.use(morgan('common'));

var bodyParser = require('body-parser');

app.use(bodyParser.json({limit:"7mb"})); // for parsing application/json, increase the limit to send json (url encoded image)
app.use(bodyParser.urlencoded({ limit: "7mb", extended: true })); // for parsing application/json, increase the limit to send json (url encoded image)



//--setup for heroku deployment
app.use(express.static(path.resolve(__dirname, "./client/build")));



app.use('/users/', userRoutes)
app.use('/posts/', postRoutes)


//all other routes must use routes in client, needed for production (heroku deployment)
app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});







