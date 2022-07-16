import './timeline.css'
import Share from '../share/share'
import Post from '../posts/post'
import React, {useState, useContext, useEffect} from 'react'
import axios from 'axios'
import { Context } from '../../contextapi/Context'


export default function Timeline(){ 
   const [post, setPost] = useState('')
   const {currentUser} = useContext(Context) //grabs the state from context

   const userId = currentUser._id
   const user = currentUser

   const [reRender, setreRender] = useState(1);
   
   //this function is used to rerender the component when a post has been created (in share component)
   //this function changes the value in rerender state. this is a dependancy for useEffect hook, which will trigger the component to rerender.
   const reset = () => {
        setreRender(Math.random());
    }


   //makes api request to backend to retrieve timeline posts of current userId, then sorts it by descending order
   //every time the post state changes (when adding new post in share component), this function re-renders feed component on page to reflect changes
   React.useEffect(()=>{
        if(userId){
            const initialfetch = async function(){
                    await axios.get(`/posts/api/timeline/${userId}`).then((response)=>{
                        setPost(response.data.sort((p1,p2)=>{
                            return new Date(p2.createdAt) - new Date(p1.createdAt)
                        }))
                })
            }
            initialfetch()
        }
    },[userId, reRender])


    return (
        //iterates through the post state, and renders a post child component with id and post data as props.
        <div className="feed-container">
            <div className= 'feed-wrapper' >
                <Share user={user} rerender={reset} />
                {post.length > 0 ? 
                (post.map(e=>(
                    <Post id={e.userId} post={e} rerender={reset} key={e._id} />
                ))) 
                : 
                ('')}
            </div>
        </div>
        
    )
}