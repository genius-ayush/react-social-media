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
                    <div className="rightbar-top">
                        <img className='gift' src="./assets/gift.png" alt="" />
                        <span>John smith and few others have a birthday today</span>
                    </div>
                    <div className="rightbar-middle">
                        <img className='ad' src="./assets/ad.png" alt="" />
                    </div>
                    <div className="rightbar-bottom">
                        <ul className='online-container'>
                        <span>online friends</span>
                        <hr className='separator' />
                            {friends.map(e=>( /* dont use { use ( since you are rendering component, not returning a result*/
                                <Online key={e.id} friend={e}/>
                            ))}
                        </ul>
                    </div>  
                </div>
            </div>
        );
    }
    //rightbar component for profile page
    const ProfileRightbar = () => {

        return (
            <div className="rightbar-container">
                <div className="rightbar-wrapper-profile">
                    <div className="rightbar-top-profile">
                    <h3 className='userinfo'>User Information</h3>

                        <div className='info-item'>
                            <span><b>City</b> : New York</span>
                        </div>
                        <div className='info-item'>
                            <span><b>From</b> : Toronto</span>
                        </div>
                        <div className='info-item'>
                            <span><b>Relationship</b> : single</span>
                        </div>
                        {/*follow/unfollow buttons */}
                        {/* nested ternary, first checks to see if you are viewing your profile, since you cant follow yourself, it will render no button */}
                        {/*first checks if currentuser is loaded into state (after first render cycle), then checks if the user is followed or not, conditionally rendering the buttons */}
                        {currentUser._id !== profileid.id ? 
                            (currentUser && !currentUser.followingCount.includes(id) ? 
                                (<Button className='followbutton'  variant='primary' onClick={follow}>follow</Button>)
                                : 
                                (<Button className='followbutton' variant='primary'  onClick={unfollow}>unfollow</Button>)
                            ) 
                            : 
                            ('')
                        }
                    </div>
                    <div className="rightbar-bottom-profile">
                        <ul className='friends-container'>
                        <span>Friends List</span>
                        <hr className='separator' />
                        <div className='profiles'>
                            {friends.map(e=>( /* dont use { use ( since you are rendering component, not returning a result*/
                                <Friendslist key={e.id} friend={e} />
                            ))}
                        </div>
                        </ul>
                    </div>
                </div>
            </div>
        )

    }    

    return(
        <>  
            {profile ?   <ProfileRightbar/> : <HomeRightbar /> /*will render the subcomponent based on props passed in parent (right bar) */}
        </>
        
        
    )

}
