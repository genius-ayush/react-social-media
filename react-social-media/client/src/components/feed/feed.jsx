import './feed.css'
import Post from '../posts/post'
import React, {useState, useParams} from 'react'
import axios from 'axios'

export default function Feed({userId}){ 

   const [post, setPost] = useState({})
   const [reRender, setreRender] = useState(1);
   
   //this function is used to rerender the component when a post has been created (in share component)
   //this function changes the value in rerender state. this is a dependancy for useEffect hook, which will trigger the component to rerender.
   const reset = () => {
        setreRender(Math.random());
    }

   //makes api request to backend to retrieve posts with current userId, then sorts it by descending order
   //every time the post state changes (when adding new post in share component), this function re-renders feed component on page to reflect changes
   React.useEffect(()=>{
            const initialfetch = async function(){
                    await axios.get(`/posts/api/${userId}`).then((response)=>{
                        setPost(response.data.sort((p1,p2)=>{
                            return new Date(p2.createdAt) - new Date(p1.createdAt)
                        }))
                })
            }
            initialfetch()
    },[userId,reRender]) //rerender is a dependency, so we can run the useeffect and refresh the feed when we need to.

    return (
        /*set the class based on if profile props is passed, cause profile page has slightly different feed styling*/
        //in the feed container, there are two class styles based on whether feed component is rendered on profile page or home page
        //then it iterates through the post state, and renders a post child component with id and post data as props.
        <div className="feed-container">
            <div className= 'feed-wrapper'>
                {post.length > 0 ? 
                (post.map(e=>(
                    <Post id={e.userId} post={e} key={e._id} rerender={reset} />
                ))) 
                : 
                (<div className='firstpost'>
                    <h1>Create your first post</h1>
                </div>)}
            </div>
        </div>
        
    )
}