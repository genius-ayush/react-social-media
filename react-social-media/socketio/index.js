const { Server } = require('socket.io')

const PORT = process.env.PORT || 3000

//create new socketio server instance, specifying port and client url
const io = new Server(PORT, {
    cors: {
        origin: `http://localhost:${PORT}`,
    }
}, console.log('connected'));

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



