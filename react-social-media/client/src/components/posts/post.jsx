import { friends } from "../../dummydata"
import './post.css'
import { MoreVert, ThumbUp } from "@material-ui/icons";
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios'
import { Context } from "../../contextapi/Context";
import Button from "react-bootstrap/esm/Button";



export default function Posts({id,post,rerender}){
    const {currentUser} = useContext(Context) //grabs the state from context
    
    //state to store the details of the post creator
    const [user, setUser] = useState({})

    //useEffect hook is called to fetch data of the creator of the post
    //must be called for each post component, so there will be many api calls when first rendering feed (since each post needs an api call to get user data)
    React.useEffect(()=>{
        const fetch = async ()=>{
            await axios.get(`/users/${id}`).then((response)=>{
                setUser(response.data)
            })
        }
        fetch();
    },[id])  //put put id in dependendency instead of empty array, or else weird issues with useeffect, where it will load wrong user for some reason.

    //state for managing post likes
    const [like, setLike] = useState(post.likes.length)

    //state which checks to see if user already liked the post
    const [isliked, setisLiked] = useState(post.likes.includes(currentUser._id))

    

    const handleLike = async function(req,res){
        /* if post already liked, remove a like, otherwise add a like*/
        setLike(isliked ? (like - 1) : (like + 1) )
        /* sets isliked to true (or false) */
        setisLiked(!isliked)
        //send post request to likes controller
        await axios({
            method:"POST",
            data: {userId: currentUser._id },
            headers: { 'Content-Type': 'application/json' },
            url:`/posts/like/d/${post._id}`
        }).then((response)=>{
            alert(response.data)
        })
    }

    //checks if the post creator has profile pic, otherwise default pic
    const profileimg = user.profilePicture ? (user.profilePicture) : ("./assets/profile.png")


    const deletepost = async function(){
        try{
            await axios({
                method:"DELETE",
                data: {userId: currentUser._id },
                headers: { 'Content-Type': 'application/json' },
                url:`/posts/api/${post._id}`
            }).then((res)=>{rerender()})
        }catch(err){console.log('error in post component')}
    }
    return(
        <div className="post-container">
            {/* conditional rendering of element based on if there is an associated user with the post id, took a while to get right */}
            {profileimg !==undefined &&
                <div className="wrapper">
                    <div className="post-top">
                        <div className="post-top-left">
                            <a href={`/profile/${id}`}>
                                <img className="post-top-item postprofileimgtop" src={profileimg} alt="" />
                            </a>
                            <span className="post-top-item username">{user.username}</span>
                            <span className="post-top-item date">{post.createdAt}</span>
                        </div>
                        <div className="post-top-right">
                        {/*current user can only delete his own posts */}
                        {currentUser._id === post.userId ? <Button variant="danger" onClick={deletepost}>Delete</Button> : ''}
                            <MoreVert />
                        </div>
                    </div>
                    <div className="title">
                        {post.description}
                    </div>
                    <div className="post-center">
                        <img className="postimg" src={post.img} alt="" />
                    </div>
                    <div className="post-bottom">
                        <div className="post-bottom-left">
                            <ThumbUp className="thumbs" onClick={handleLike} />
                            <span>{like} people like this</span>
                        </div>
                        <div className="post-bottom-right">
                            {/*<span>{post.post.comment} comments</span>*/}
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}            