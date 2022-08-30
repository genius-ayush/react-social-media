import React from 'react'
import './hamburgermessenger.css'
import { Person, Search, Chat } from '@material-ui/icons'
import Recentfriends from '../../components/recentfriends/recentfriends'
import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Context } from '../../contextapi/Context';
import axios from 'axios'
import { elastic as Menu } from 'react-burger-menu'
import Convos from '../../components/convos/convos'


export default function HamburgerMessenger() {

//all of the conversations of the current user
const [Conversations, setConversations] = useState(null)
//the selected conversation the user has clicked to view
const [Selected, setSelected] = useState(null)
//grabs the current logged in user fron context api
const {currentUser, fetchUser} = useContext(Context)

//all messages of a particular conversation, stored in state
const [Message, setMessage] = useState(null)

//The friends list from logged in user
const [friends, setFriends] = useState([])

  //store friends list in state 
  //friends are distinguished if a user is following someone, and that person is also following them back.
  useEffect(()=>{
    currentUser && currentUser.followingCount.map(e=>{if(currentUser?.followerCount.includes(e)){setFriends((prev)=>[...prev,e])}})
  },[currentUser]) 

//sets the view of the selected conversation, when user clicks on a profile on left
  //'Selected' state changes when the user clicks on a different conversation on the left
  //this is because each profile has onclick event, which updates 'Selected' state
  useEffect(()=>{
    try{
      const getMessages = async function(){
        //fetch messages of the 'Selected' conversation
        await axios.get(`/messages/${Selected._id}`).then(res=>{
          setMessage(res.data);
        })
      }
      getMessages()
    }catch(err){console.log(err)}
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
          if(res.data.length === 0 && friends.length > 1 && currentUser){
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
    //this hook is used to update conversation list state after convos are created
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
  },[Conversations,friends])  

  return (
    <>
      <Menu right>
      <div className="convoWrapper">
        <span style={{color:'gray'}}>Friends List</span>
        <hr className='separator'/>

          <div className="convoTop">
            <input className='searchFriends' style={{border:'0.5px solid gray'}} type="text" placeholder='Search your friends' />
          </div>
          {Conversations && Conversations?.map(e=>(
            /*stores selected conversation in state (Selected state)*/
            <div onClick={()=>{setSelected(e)}}>
              {/*render convo component for each conversation that user has with other people */}
              <Convos data={e} currentUser={currentUser}/>
            </div>
          ))}     
        </div>
        </Menu>
    </>
  )
}
