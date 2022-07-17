import './profileheader.css'
import axios from 'axios'
import React, { useState, useContext } from 'react'
import { Context } from '../../contextapi/Context'
import Button from 'react-bootstrap/esm/Button'

export default function ProfileHeader({id}){
    //state for urlencoded profile pic, and cover pic
    const [preview, setPreview] = useState('')
    const [previewCoverPic, setpreviewCoverPic] = useState('')

    const {currentUser, fetchUser} = useContext(Context) //grabs the state from context

    
    //grab user object of the profile page from api. it grabs id as prop from profile page, which is taken from url (useparams)
    const [users, setUser] = useState({});
    React.useEffect(() => {
        const fetch = () =>{
            axios.get(`/users/${id}`).then((response) => {
                setUser(response.data);
                })
        }
        fetch();
    },[]);//empty array ensures it renders once
    
    //-----------------profile pic handler --------------------------------------------------------
    //grab the file from input and store it in state, and also passing it to preview function to view a preview of image
    function handleinputfile(e){
        const file = e.target.files[0]
        if ( /\.(jpe?g|png|gif)$/i.test(file.name)){ //test file name if its name matches allowed inputs
            previewFile(file)
        }
    }
    //preview function that uses filereader api to create url encoded image, and to display it as viewable image
    function previewFile(file){
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = ()=>{
            setPreview(reader.result)
        }

    }
    //function that sends the image stored in profile pic state as an api request, to profile pic controller in backend
    async function uploadProfile(profile){
             await axios({
                method:"PUT",
                data: JSON.stringify({profilepic: profile}),
                headers: { 'Content-Type': 'application/json' },
                url:'/users/profilepic'
            }).then((res)=>{window.location.reload()})
    }
    //----------------------------------------------------------------------------------------

    //-----------------cover pic preview handler ---------------------------------------------
    function handleCover(e){
        const file = e.target.files[0]
        if ( /\.(jpe?g|png|gif)$/i.test(file.name)){ //test file name if its name matches allowed inputs
            previewCover(file)
        }
    }

    function previewCover(file){
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend=()=>{
            setpreviewCoverPic(reader.result)
        }
    }
    
    //function that sends the image stored in cover pic state as an api request, to cover pic controller in backend
    async function uploadCover(cover){
        try{
            await axios({
                method:"PUT",
                data: JSON.stringify({coverpic: cover}),
                headers: { 'Content-Type': 'application/json' },
                url:'/users/coverpic'
            }).then((res)=>{window.location.reload()})
        }catch(err){alert(err)}
    }

    //------------------------------------------------------------------------------------------

    //first checks if image is loaded in either profile state or cover state
    //this function calls the profile pic and/or cover pic api requests
    //resets the profile pic and cover pic states
     async function handlesubmit(e){
        e.preventDefault()
        if(!preview && !previewCoverPic){return}
        if (preview){
            try{
                uploadProfile(preview)
                setPreview('')
            }catch(err){console.log('error in profileheaer')}
        }
        if (previewCoverPic){
            try{
                uploadCover(previewCoverPic)
                setpreviewCoverPic('')
            }catch(err){console.log('error in profileheader')}
        }
    }


    return (
        <div className='profilewrapper'>
            {/*Checks if there is a profile pic or cover pic on the acc, or default pic */}
            {/*if theres an image in preview state, it will overwrite the profile pic or cover pic */}
            <div className='profiletop'>
                {/* label allows to link to input field, so that clicking the cover image or profile image targets file input, its only clickeable if the user is on their own page */}
                    <label className='coverpiclabel'  style={currentUser._id === id ? {cursor:'pointer'} : {cursor:'default'}} htmlFor={currentUser._id === id ? 'cover' : ''}>{/*label needs to inherit the classname so it keeps same formatting  */}
                        {users.coverPicture && !previewCoverPic ?
                            (<img className='coverimg' src={users.coverPicture} alt="" />) 
                            :
                            previewCoverPic ?
                                (<img className='coverimg' src={previewCoverPic} alt="" />) 
                                :
                                (<img className='coverimg' src="/assets/cover.jpeg" alt="" />)
                        }
                    </label>
                    <label style={currentUser._id === id ? {cursor:'pointer'} : {cursor:'default'}} htmlFor={currentUser._id === id ? 'profile' : ''}>
                        {users.profilePicture && !preview ? 
                            (<img className='profileimg' src={users.profilePicture} alt="" />) 
                            :
                            preview ? 
                                (<img className="profileimg" src={preview} alt=''/>) 
                                : 
                                (<img className='profileimg' src="/assets/profile.png" alt="" />)
                        }
                    </label>
            </div>
            <div className='profilebottom'>
                {previewCoverPic || preview ? //if theres an image in state, render save button
                    <Button onClick={handlesubmit} variant='primary' style={{marginbotton:'10px'}}>Save</Button> : ''
                }
                <div className='profile-name'>{users.username}</div>
            </div>
            <input type='file'  accept="image/gif, image/jpeg, image/png" style={{display:'none'}} id='profile'  onChange={handleinputfile}/>
            <input type='file'  accept="image/gif, image/jpeg, image/png" style={{display:'none'}} id='cover' onChange={handleCover}/>
        </div>
    )

}

      
