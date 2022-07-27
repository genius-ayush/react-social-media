import "./share.css";
import {PermMedia,Room, EmojiEmotions} from "@material-ui/icons"
import ShareIcon from '@material-ui/icons/Share';
import React, {useState, useRef} from 'react'
import axios from "axios";

export default function Share({user, rerender}){  
    //state for holding urlencoded preview image from file input
    const [preview, setPreview] = useState('')

    //references to input fields (description text and file)
    const description = useRef('')
    const file = useRef('')


    //grab the file from input and store it in state, and also passing it to preview function to view a preview of image
    function handleinputfile(e){
        const file = e.target.files[0]
        previewFile(file)
    }
    //preview function that uses filereader api to create url encoded image, and to display it as viewable image
    function previewFile(file){
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = ()=>{
            setPreview(reader.result)
        }

    }

    //upload function to send post to backend, userid and image is sent as JSON string
    //the awesome part of it is that once there is a response back from the backend, the component reloads
    //thats because the post request sends a request back to the front end when the request has been completed.
    //the fetch
    async function uploadImage(urlencodedimage){
             await axios({
                method:"POST",
                data: JSON.stringify({data: urlencodedimage, userId:user._id, description:description.current.value }),
                headers: { 'Content-Type': 'application/json' }, //headers necessary since we are sending json, otherwise will throw error
                url:'/posts/api/'
            })
            //reloads the page when a response is returned from api, in order to trigger feed to fetch new post data
            .then(res=>{rerender()})
    }

    //checks to see if an image is loaded in preview, then tries to send post request
    //resets preview state to initial state so image preview is cleared.
    async function handlesubmitfile(e){
        e.preventDefault()
        if(!preview) alert('please attach a photo, this is radsocial not radtwitter');
        try{
            uploadImage(preview)
            //removes preview image
            setPreview('')
            //resets input field
            description.current.value=''
            //resets file input field
            file.current.value=''
        }catch(err){console.log('error');}

    }

    return(
        <div className="share-container">
            <div className="sharewrapper">
                <div className="shareupper">
                    <a href={`/profile/${user._id}`}>
                    { user.profilePicture ? 
                    (<img src={user.profilePicture} alt="" className="shareprofilepic" />) : 
                    (<img src="./assets/profile.png" alt="" className="shareprofilepic" />) }
                    </a>
                    <input type="text" ref={description} placeholder='whats on your mind?' className="feelings" />
                </div>
                <hr className="separator"/>
                <div className="preview">
                    {preview && <img className="imagepreview" src={preview} alt=''/>}
                </div>
                <form className="sharebottom" onSubmit={handlesubmitfile}>
                    {/* outer div is a label, so that the entire element is clickeable and will interact with the file input */}
                    <label htmlFor="file" className="sharebottomitem">
                        <PermMedia className="photos" style={{cursor:'pointer'}}/>
                        {/*sends the file selected to state, and its display is set to none so we can use the Permedia icon as the defacto button */}
                        {/*only accepts jpeg img or gif or png */}
                        <input ref={file} style={{display: 'none'}} accept="image/gif, image/jpeg, image/png" type='file' id='file'  onChange={handleinputfile}/>
                    </label>
                    <div className="sharebottomitem">
                        <ShareIcon className="tag" />
                    </div>
                    <div className="sharebottomitem">
                        <Room className="location"/>
                    </div>
                    <div className="sharebottomitem">
                        <EmojiEmotions className="emotions" />
                    </div>
                    <button className="share">share</button>
                </form>
            </div>            
        </div>
    )
}
