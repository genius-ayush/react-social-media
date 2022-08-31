import Topbar from '../../components/topbar/topbar'
import Messages from '../../components/messages/messages'
import Convos from '../../components/convos/convos'
import './messages.css'
import {useState, useRef, useEffect, useContext} from 'react'
import { Context } from '../../contextapi/Context';
import Button from 'react-bootstrap/Button';
import axios from "axios";
import { io } from "socket.io-client";
import React from 'react'
import { elastic as Menu } from 'react-burger-menu'
import Skeleton from 'react-loading-skeleton'


export default function Message() {

  //grabs the current logged in user fron context api
  const {currentUser, fetchUser} = useContext(Context)
  
  //The friends list from logged in user
  const [friends, setFriends] = useState([])

  //online friends
  const [onlinefriends, setOnlineFriends] = useState(null)

  //friend data that logs in
  const [loggedinuser, setLoggedInUser] = useState(null)

  //friend data that leaves socket server (disconnects from site)
  const [loggedoutuser, setLoggedOutUser] = useState(null)

    //incoming event from socket server
  const [incomingMessage, setIncomingMessage] = useState(null)

  //all of the conversations of the current user
  const [Conversations, setConversations] = useState(null)

  //the selected conversation the user has clicked to view
  const [Selected, setSelected] = useState(null)

  //all messages of a particular conversation, stored in state
  const [Message, setMessage] = useState(null)

  //store the message text from input, updated dynamically
  const [NewMessage, setNewMessage] = useState('')

  //detect when component is finished rendering
  const [loading, setLoading] = useState(true)

  //store socket url in useRef state
  const socket = useRef()

  //setting up client socket
  useEffect(()=>{
    //set client socket to point to socket api
    socket.current = io(`ws://rad-social.herokuapp.com`)
    //listen to when theres incoming message, then store incoming message in state
    //this is the 'outbound' message thats being sent to client after having been routed through server, and sent to the intended recipients
    
    socket.current.on('incomingMessage', (data)=>{
      setIncomingMessage({
        sender:data.sender,
        messagetext:data.message,
        //it only contains sender and text data, so date is appended
        createdAt:Date.now()
      })
    })

   //whenever connecting to socket, you see which friends are already online
      socket.current.on('friendslist', (data)=>{
        setOnlineFriends(data)
      })
  //whenever friend logs in, theyre added to online array
  //loggedout friend state gets reset to detect next loggedout user
      socket.current.on('loggedinUser', (data)=>{
        setLoggedInUser(data)
        setLoggedOutUser(null)
      })

  //whenever friend disconnects, they are removed from online state
  //loggedin user gets reset to detect next logged in user
      socket.current.on('loggedOutUser', (data)=>{
        setLoggedOutUser(data)
        setLoggedInUser(null)
      })

  },[])

  //when friend logs in, theyre added to onlinefriends array
  useEffect(()=>{
    if(onlinefriends === null && loggedinuser){
      setOnlineFriends(loggedinuser)
    }
    if(onlinefriends && loggedinuser){
      if(!onlinefriends.includes(loggedinuser)){
        setOnlineFriends(prev=>[...prev,loggedinuser])
      }
    }
  },[loggedinuser])

  //when friend logs out, they are removed from online array
    useEffect(()=>{
      if(loggedoutuser  && onlinefriends  && onlinefriends.includes(loggedoutuser)){
        let filtered = onlinefriends.filter(e=>e!==loggedoutuser)
        setOnlineFriends(filtered)
      }
      if(loggedoutuser && onlinefriends && onlinefriends.length === 1 && onlinefriends.includes(loggedoutuser)){
        setOnlineFriends([])
      }

    },[loggedoutuser])

  //store friends list in state 
  //friends are distinguished if a user is following someone, and that person is also following them back.
  useEffect(()=>{
    currentUser && currentUser.followingCount.map(e=>{if(currentUser?.followerCount.includes(e)){setFriends((prev)=>[...prev,e])}})
  },[currentUser]) 

  //store user thats logged in, into socketio server, to track whos online (connected)
  //it runs when friends is loaded to state
  //sends storeuser event to server, which handles storing user info, and friends info, and doing important things behind the scenes.
  useEffect(()=>{
      currentUser && friends && socket?.current.emit('storeUser', ({userId:currentUser._id,friends:friends}) )
  }, [friends])


  //this hook listens to see if incomingMessage gets updated, then it updates message object
  //it runs everytime client socket receives incomingMessage event
  //then it updates the state with any new messages, making so that new messages are rendered without having to refresh page
  useEffect(()=>{
    Message && setMessage(prev=>[...prev, incomingMessage])
  },[incomingMessage])

  //send new message to server
    const handlesubmit = async function(e){
      e.preventDefault()
      //send new message to socketio server
      socket.current.emit('outgoingMessage', {
        sender: currentUser?._id,
        receiver: Selected.people.find(e=> e !== currentUser._id) ,
        message: NewMessage
      })
      try{
          await axios({
            method:"POST",
            //data sent as req.body
            data: {
              conversationId: Selected._id,
              messagetext: NewMessage,
              sender: currentUser._id
             },
            headers: { 'Content-Type': 'application/json' },
            url:`/messages/`
          }).then(res=>{setNewMessage('')})
      }catch(err){console.log(err)}
    }

  //functional component to scroll to bottom of a particular container
  const AlwaysScrollToBottom = () => {
    //create reference to div elementRef, and store it in useref state
    const elementRef = useRef('');
    //useEffect selects the reference div, and scrolls into view (strategically placed in bottom of container)
    useEffect(() => elementRef.current?.scrollIntoView({ behavior: 'smooth' }));
    return <div ref={elementRef} />;
  };

  //sets the view of the selected conversation, when user clicks on a profile on left
  //'Selected' state changes when the user clicks on a different conversation on the left
  //this is because each profile has onclick event, which updates 'Selected' state
  useEffect(()=>{
    if(Selected){ //selected is null in beginning, dont need unecessary useeffect call
      try{
        const getMessages = async function(){
          //fetch messages of the 'Selected' conversation
          await axios.get(`/messages/${Selected._id}`).then(res=>{
            setMessage(res.data);
          })
        }
        getMessages()
      }catch(err){console.log(err)}
    }
  },[Selected])

  //store friend conversations of loggedin user, in state
  //great way to learn useEffect hooks, was very difficult to get this hook right
  useEffect(()=>{
    //this hook looks to see if its a new user and no convos created yet
    try{
      let pendingconvos = []
      const getConversations = async function(){
        //must first wait for currentUser to load from context, and friends list to be loaded to state
        //query server to get all open conversations of user
        currentUser && friends && await axios.get(`/conversations/${currentUser._id}`).then(res=>{
          //if there is no conversation data from currentuser (res.data.length === 0)
          //it will map over friends list, then create a conversation
          if(res.data.length === 0 && friends.length > 0 && currentUser){
            friends.map(async e=>await axios.post('/conversations', {
              senderId:currentUser._id,
              receiverId: e 
            }).then(res=>{
              pendingconvos.push(res.data)
            }))
          }
        //set conversation state with newly created conversation data (possibly new user), or data from server
      })
      setConversations(pendingconvos)
    }
    getConversations()
  }catch(err){alert(err)}
  //since friends is derived from currentUser, its better to use as dependancy
  },[friends])  

  useEffect(()=>{
    //this hook is used if user already has conversations
    try{
      let pendingconvos = []
      const getConversations = async function(){
        //must first wait for currentUser to load from context, and friends list to be loaded to state
        //query server to get all open conversations of user
        currentUser && friends && await axios.get(`/conversations/${currentUser._id}`).then(res=>{
          //pendingconvos will have all conversations of friends
          //then conversation state will be updated with pendingconvo
          //if user has conversations (res.data.length > 0), it will map over the conversations
          //then it will check to see if that conversation is a friend conversation
          if(res.data.length > 0){
            res.data.map(async conversation=>{
              for(let i=0; i<friends.length;i++){
                if(conversation.people.includes(friends[i])){
                  pendingconvos.push(conversation)
                }
              }})
          }
        //set conversation state with newly created conversation data (possibly new user), or data from server
      })
      setConversations(pendingconvos)
    }
    getConversations()

  }catch(err){alert(err)}
  //since friends is derived from currentUser, its better to use as dependancy
  },[friends])  

  return (
  <>
    <Menu right>
      <div className="convoWrapper2">
        <span style={{color:'gray'}}>Friends List</span>
        <hr className='separator'/>

          <div className="convoTop2">
            <input className='searchFriends' style={{border:'0.5px solid gray'}} type="text" placeholder='Search your friends' />
          </div>
          {Conversations && Conversations?.map((e,i)=>(
            /*stores selected conversation in state (Selected state)*/
            <div onClick={()=>{setSelected(e)}} key={i} className='menubottom'>
              {/*render convo component for each conversation that user has with other people */}
              <Convos data={e} currentUser={currentUser} online={onlinefriends}/>
            </div>
          ))}     
        </div>
      </Menu>
    <div className="messagesContainer">
      <Topbar messenger={true}/>
      <div className="messenger">
        <div className="convoWrapper">
        <span style={{color:'gray'}}>Friends List</span>
        <hr className='separator'/>
          <div className="convoTop">
            <input className='searchFriends' style={{border:'0.5px solid gray'}} type="text" placeholder='Search your friends' />
          </div>
          {Conversations ? (Conversations.map((e,i)=>(
            /*stores selected conversation in state (Selected state)*/
            <div key={i} onClick={()=>{setSelected(e)}}>
              {/*render convo component for each conversation that user has with other people */}
              <Convos data={e} currentUser={currentUser} online={onlinefriends}/>
            </div>))) : (<Skeleton count={5}/>) 
          }     
        </div>
        <div className="messageWrapper">
        {Selected ? 
        <>
          <div className="messages">
            {Message?.map((e,i)=>(
              //if sender of message is same as logged in user, sender prop is sent to true
              //this will style the messages component based if sender data (owner) of message is same as currentuser
              <Messages key={i} data={e} sender={e.sender === currentUser._id}/>
              //only data.sender and data.messagetext, and data.createdAt is used to render component
              //to be used to store incoming message format
            ))}
            <AlwaysScrollToBottom />
          </div>
          <div className="messageBottom">
            <textarea className='textarea' onChange={e=>setNewMessage(e.target.value)} name="" id="" value={NewMessage} cols="30" rows="5" placeholder='write something...'></textarea>
            <Button className='send' variant='success' onClick={handlesubmit}  href=''>Send</Button>
          </div>    
        </> 
        :
        <>
        <h1 className='selectmessage'>Select a conversation to view</h1>
        <h1 className='selectmessage2'>Select a conversation to view in top right</h1>
        </> 
        }   
        </div>
      </div>
    </div>
  </>
  )
}


