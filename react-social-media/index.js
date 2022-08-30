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
const messageRoutes = require('./Routes/Messages')
const conversationRoutes = require('./Routes/Conversations')
const app = express();
const socket  = require('socket.io')

const http = require('http')

const server = http.createServer(app)

const PORT = process.env.PORT || 3000

const io = socket(server, {
    cors: {
        origin: `https://rad-social.herokuapp.com/:${PORT}`,
    }
}, console.log('connected'));


server.listen(process.env.PORT || 3001, ()=>{
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
app.use('/messages', messageRoutes )
app.use('/conversations', conversationRoutes)


//all other routes must use routes in client, needed for production (heroku deployment)
app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

//socketio--------------------------------------------------------------------


//store connected users socketid and userid (sender and receiver)
let users = []


//every time unique user connects to socketio server, user object is stored
const addUser = (userId, socketId)=>{
    users.push({ userId, socketId })
}

//user is removed from connected users list when disconnected from socket
const removeUser = (socketId)=>{
    users = users.filter(e=>{ return e.socketId !== socketId})
}

const getUser = (userId)=>{
    return users.find(e=>e.userId === userId)
}

  io.on("connection", (socket) => {
    //first event, when user connects
    console.log('user has connected')

    //stores the user when he connects to socket
    socket.on("storeUser", (data)=>{
        //create room, which stores socketid of connected user. room name is userid for convenience
        socket.join(`${data.userId}`);
        //storing friend data on socket, so it can be accessed in disconnect function below, not just on storeuser function
        //therefor friends data of the current user isnt stored globally, its only accessible in the socket, unlike users object, which is a list of all online users
        socket['friends'] = data.friends
        socket['userId'] = data.userId
        addUser(data.userId,socket.id)
        //list of friends of user
        let friends = data.friends
        //check if user is a new user and has friends, otherwise socket will break (friends undefined)
        if(data.friends){
            let friendslist = users.filter(e=>{ return friends.includes(e.userId)})
            //list of online friends of user
            let friendslist2 = friendslist.map(e=>e.userId)
            friendslist2.length > 0 && io.to(socket.id).emit('friendslist',friendslist2)
            //sends an event to all friends of logged in user
            //everytime a friend connects to socket, a room is made and room name is friendid
            //its very efficient to do it this way, in my opinion
            for(let i = 0; i < friends.length; i++){
                if(io.sockets.adapter.rooms.get(friends[i])){
                    io.to(friends[i]).emit('loggedinUser', data.userId)
                }
            }
            }
        
    })
    

    //receives an event from client called (outgoing message) to be sent to receiver
    socket.on('outgoingMessage', ({ sender, receiver, message })=>{
        //find socketid from intended recipient stored in user state (if hes connected to socket)
        //unless recipient connects to socket server, recipient will be undefined
        const recipient = getUser(receiver)
        const sending = getUser(sender)
        //sends incoming message event to recipient, IF HES CONNECTED TO SOCKET
            recipient && io.to(recipient.socketId).emit("incomingMessage", {
                sender,
                message
            })  
        //sends incoming message event to sender
            io.to(sending.socketId).emit("incomingMessage", {
                sender,
                message
            })

    })

    //since socketio assigns new socket.id every time a connection is made,
    //you need to constantly find a way to know the current socket.id of user
    //this method checks to see if a user disconnects from socketio server (leaves page)
    //then the user and socketid is removed from users state (users array)
    //when user reconnects, userid and new socketid is added to user array (state)
    //this is how we can track users 'online'
    socket.on("disconnect", ()=>{
        console.log('user has disconnected')
        removeUser(socket.id)
            //check if user has friends, otherwise will break socket (friends undefined)
            if(socket['friends']){
            //send event to all friends of current user that user is offline. update status in real time
            for(let i = 0; i < socket['friends'].length; i++){
                if(io.sockets.adapter.rooms.get(socket['friends'][i])){
                    io.to(socket['friends'][i]).emit('loggedOutUser', socket['userId'])
                }
            }
        }
    
    })
  });
