import '../../components/feed/feed'
import '../../components/left-sidebar/left-sidebar'
import Leftsidebar from '../../components/left-sidebar/left-sidebar'
import '../../components/rightbar/rightbar'
import Rightbar from '../../components/rightbar/rightbar'
import Topbar from '../../components/topbar/topbar'
import './profile.css'
import ProfileHeader from '../../components/profileheader/profileheader'
import { useParams } from 'react-router-dom'
import { useEffect, useContext, useState, useRef } from 'react'
import axios from 'axios'
import Feed from '../../components/feed/feed'
import { Context } from '../../contextapi/Context'
import Hamburger from '../../components/hamburgermenu/hamburger'
import { io } from "socket.io-client";




export default  function Profile(){
//store socket url in useRef state
  const socket = useRef()
  
  //grabs the current logged in user fron context api
  const {currentUser, fetchUser} = useContext(Context)


  //store user thats logged in, into socketio server, to track whos online (connected)
  //it runs when currentuser is loaded to state
  //sends storeuser event to server, which will create a user object in socketio server containing the socketid and userid
  useEffect(()=>{
    currentUser && socket.current.emit('storeUser', currentUser._id )
    }, [currentUser])


      //setting up client socket
  useEffect(()=>{
    //set client socket to point to socket api
    socket.current = io(`ws://rad-social.herokuapp.com:${process.env.PORT}`)
    //listen to when theres incoming message, then store incoming message in state
    //this is the 'outbound' message thats being sent to client after having been routed through server, and sent to the intended recipients
  },[])




    //userid of person's profile you are viewing
    const userId = useParams();


    const [reRender, setreRender] = useState(1);
   
    //this function is used to rerender the component when a post has been created (in share component and post component for example)
    //this function changes the value in rerender state. this is a dependancy for useEffect hook, which will trigger the component to rerender.
    //this is used to selectively rerender particular components, more selective than window.location.reload()
    const reset = () => {
         setreRender(Math.random());
     }

    return(
        <>
            <Hamburger profile={userId}/>
            <Topbar  home={true} profile={true} />
            <div className="profile-container">
                <div className="content">
                    <div className='leftbar'>
                        <Leftsidebar profile={userId} />
                    </div>
                    <div className='profileright'>
                        <div className="profile-top">
                            <ProfileHeader id={userId.id}/>
                        </div>
                        <div className="profile-bottom">
                            <Feed userId={userId.id}/>
                        </div>
                    </div> 
                </div>
            </div>
    </>
    )
}