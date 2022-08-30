import './timeline.css'
import Share from '../share/share'
import Post from '../posts/post'
import React, {useState, useContext, useEffect} from 'react'
import axios from 'axios'
import { Context } from '../../contextapi/Context'
import SkeletonComponent from "../skeleton/skeleton";


export default function Timeline(){ 
   const [post, setPost] = useState(null)
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
                //only show timeline posts of friends (followercount and followingcount contains same userid)
                    await axios.get(`/posts/api/timeline/${userId}`).then((response)=>{
                        let res = []
                        //friend posts fetch (parse response data to only show friend posts **the user must be following currentUser**)
                        currentUser.followingCount.map(e=>{
                            for(let i=0;i<response.data.length;i++){
                                if(response.data[i].userId === e){
                                    res.push(response.data[i])
                                }
                            }
                        })
                        //currentuser posts fetch  (parse response data to show user posts)
                        response.data.map(e=>e.userId === currentUser._id && res.push(e))
                        setPost(res.sort((p1,p2)=>{
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
                {post && post.length > 0 && (post.map(e=>(<Post id={e.userId} post={e} rerender={reset} key={e._id} />)))} 
                {post === null && (<div><SkeletonComponent/><SkeletonComponent/></div>)}  
                {post && post.length === 0 && <h4 className='firstpost'>Upload a picture, then press the share button. It's that easy!</h4>}  
            </div>
        </div>
        
    )
}