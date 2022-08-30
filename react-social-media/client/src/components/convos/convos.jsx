import './convos.css'
import React, {useState, useRef, useEffect} from 'react'
import axios from 'axios'


export default function Convos({ data, currentUser, online }) {

  //isolate friend/recipient from conversation array
  const friend = data.people.find(e=>{
    return e !== currentUser._id
  })
  const [Friend, setFriend] = useState(null)
  
  useEffect(()=>{
    try{
      const fetchUser = async function(){
        await axios.get(`/users/${friend}`).then(res=>{
          setFriend(res.data)
        })
      }
      fetchUser()
    }catch(err){console.log(err)}
  },[currentUser, data]) //runs every time currentuser changes or data


  return (
    <>
      <div className="convoContainer">
        <div className="convoBottom">
          {/* must have question mark to first check if friend is loaded in state otherwise issue on first render */}
          <img className='convoPic' src={Friend?.profilePicture ? Friend.profilePicture : '/assets/profile.png'} alt="" />
          <span className='convoFriend'>{Friend?.username}</span>
          {online && online.includes(friend) ? <div className='online-indicator'></div> : <div className='offline-indicator'></div>}
        </div>
      </div>
    </>
  )
}
