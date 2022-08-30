import './topbar.css'
import { Person, Search, Notifications, Chat } from '@material-ui/icons'
import { Context } from '../../contextapi/Context'
import { useEffect, useContext,useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'



export default function Topbar({ home, profile, messenger }){
    const {currentUser} = useContext(Context) //grabs the state from context
    const [search, setSearch] = useState('')
    
    let navigate = useNavigate()
    const user = currentUser

    const pub = process.env.REACT_APP_PUBLIC
    return(
        <div className='Topbar-container'>
            <div className="Topbar-left">
                <Link to='/' style={{textDecoration:'none'}}>
                    <span className="logo">RadSocial</span>
                </Link>
                <div className="topbar-profile">
                        <a href={`/profile/${user._id}`}>
                        <div className="profile-pic">
                            {user.profilePicture ?
                                (<img src={user.profilePicture} alt="" className="topbar-profileImg" />) :
                                (<img src='/assets/profile.png' alt="" className="topbar-profileImg" />)}
                        </div>
                        </a>
                    </div>
            </div>
                {/* style login button responsiveness of topbar wether topbar rendered on homepage, or messenger page*/}
                <div className={ home || profile ? `center homeandprofile` : messenger ? 'center messengerlogout' : 'center' }>
                    <a className='logoutbutton' href='/users/api/logout'>Logout</a>
                </div>
        </div>
    )
}