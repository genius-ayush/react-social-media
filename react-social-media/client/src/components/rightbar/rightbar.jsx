import './rightbar.css'
import Online from '../online/online';
import { friends } from '../../dummydata';
import Friendslist from '../friendslist/friendslist';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Context } from '../../contextapi/Context';
import { useContext, useState } from 'react';

/* passing profile par */
export default function Rightbar( { profile, id }){
    const {fetchUser,currentUser} = useContext(Context)

    const profileid = useParams() //grab profile id from url

    const follow = async function(){
        await axios.put(`/users/api/${id}/follow`).then(res=>{window.location.reload()}) //rerender entire page when request completes
    }
    const unfollow = async function(){
        await axios.put(`/users/api/${id}/unfollow`).then(res=>{window.location.reload()})
    }
    //rightbar component for home page
    const HomeRightbar = () => {
        return(
            <div className="rightbar-container">
                <div className="rightbar-wrapper">
                    <div className="rightbar-middle">
                        <img className='ad' src="./assets/ad.png" alt="" />
                    </div>
                </div>
            </div>
        );
    }

    return(
        <>  
             <HomeRightbar/>
        </>
        
        
    )

}
