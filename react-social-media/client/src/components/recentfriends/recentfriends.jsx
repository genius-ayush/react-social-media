import './recentfriends.css'
import React, { useState } from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'



export default function Recentfriends({ id }){
    const [user, setUser] = useState(null)

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
            {user ? (     
            <li>
                <a className='link' href={`/profile/${id}`}>
                {user && user?.coverPicture ? 
                    (<img src={user.profilePicture} alt="" className="friendprofilepic" />) : 
                    (<img src='/assets/profile.png' alt="" className="friendprofilepic" />)
                }
                
                <span>{user && user.username}</span>
                </a>
            </li>) 
            : 
            (<div style={{display:'flex',justifyContent:'space-around',alignItems:"center"}}>
                <Skeleton circle width={40} height={40}/>
                <Skeleton width={100}/>
            </div>
            )}

        </div>

)}