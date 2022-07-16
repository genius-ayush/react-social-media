import './recentfriends.css'
import React, { useState } from 'react'
import { useEffect } from 'react'
import axios from 'axios'



export default function Recentfriends({ id }){
    const [user, setUser] = useState('')

    //hook to grab the user of each friend, and store it in user state
    useEffect(()=>{
        try{
            const fetchUser = async function(){
                await axios({
                    method: "GET",
                    url:`/users/${id}`,
                    //if response is successful, updates user stored in context, and fetches the user from context
                }).then(res=>{
                    setUser(res.data)
                })
            }
            fetchUser()
        }catch(err){
            console.log('error in recentfriends component')
         }
    },[id])
    return(
        //render friend information
        <div className='Friend'>
            <li>
                <a href={`/profile/${id}`}>
                {user.coverPicture ? 
                    (<img src={user.profilePicture} alt="" className="friendprofilepic" />) : 
                    (<img src={`/assets/profile.png`} alt="" className="friendprofilepic" />)
                }
                </a>
                <span>{user.username}</span>
            </li>
        </div>

)}