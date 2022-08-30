import React, {useState, useEffect} from 'react'
import './messages.css'
import moment from 'moment';
import axios from 'axios';


export default function Messages({data, sender}) {

  const [MessageOwner, setMessageOwner] = useState(null)

  //store the user data of the sender of the message 
  useEffect(()=>{
    const fetchFriend = async function(){
      await axios.get(`/users/${data.sender}`).then(res=>{
        setMessageOwner(res.data)
      })
      
    }
    fetchFriend()
  },[])

  return (
    <>
      <div className="messageContainer">
        <div className={sender ? "messageTop sender" : "messageTop"}>
          <div className="message">
              <img className='messageImg' src={MessageOwner?.profilePicture ? MessageOwner.profilePicture : '/assets/profile.png'} alt="" />
              <div className="messagetext">
                <p className="text">
                  {data.messagetext}
                </p>
              </div>
          </div>
          <div className='timestamp'>{moment(data.createdAt).fromNow()}</div> 
        </div>
      </div>
    </>
  )
}
